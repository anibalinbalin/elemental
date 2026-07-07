import { NextResponse, type NextRequest } from "next/server";
import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  Invoice,
} from "mercadopago";
import { eq } from "drizzle-orm";
import { paymentClient, preApprovalClient } from "@/lib/mercadopago";
import {
  sendOrderEmails,
  sendSubscriptionWelcome,
  sendSubscriptionChargeOk,
  sendSubscriptionChargeFailed,
} from "@/lib/email";
import { getDb } from "@/lib/db";
import { subscribers, subscriptionCharges } from "@/lib/schema";

export const runtime = "nodejs";

// `lib/mercadopago.ts` doesn't expose an Invoice client (it's out of scope
// for this change), so we build one locally with the same access-token
// pattern. Despite its class name, `Invoice` is the SDK's wrapper around
// the `/authorized_payments/{id}` endpoint — the resource behind the
// `subscription_authorized_payment` webhook topic.
function invoiceClient(): Invoice {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN no está definido.");
  }
  return new Invoice(new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } }));
}

// Mercado Pago's preapproval statuses map onto our own subscriber lifecycle.
function mapPreapprovalStatus(mpStatus: string | undefined): string {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "paused";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

type WebhookBody = {
  type?: string;
  action?: string;
  data?: { id?: string | number };
};

export async function POST(request: NextRequest) {
  const url = request.nextUrl;

  let body: WebhookBody = {};
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    // Some notifications arrive with an empty body; fall back to query params.
  }

  const type =
    body.type ??
    url.searchParams.get("type") ??
    url.searchParams.get("topic") ??
    undefined;
  const dataId =
    body.data?.id?.toString() ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    undefined;

  // Verify the notification really came from Mercado Pago.
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    try {
      // Sin tolerancia temporal: el "Simular notificación" del panel firma con
      // una fecha fija de 2021, así que cualquier ventana lo rechazaría. El HMAC
      // de la firma se valida igual, por lo que la autenticidad queda garantizada
      // (no se puede falsificar sin el secreto).
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret,
      });
    } catch (error) {
      const reason =
        error instanceof InvalidWebhookSignatureError ? error.reason : "unknown";
      console.warn("[mp-webhook] rejected: invalid signature", {
        reason,
        dataId,
        type,
      });
      return new NextResponse(null, { status: 401 });
    }
  } else {
    console.warn(
      "[mp-webhook] MP_WEBHOOK_SECRET sin definir — se omite la validación de firma. Definilo antes de producción."
    );
  }

  if (type === "payment" && dataId) {
    try {
      const payment = await paymentClient().get({ id: dataId });
      if (payment.status === "approved") {
        console.log("[mp-webhook] pago aprobado", {
          id: payment.id,
          amount: payment.transaction_amount,
          email: payment.payer?.email,
          reference: payment.external_reference,
        });
        // Email is best-effort: the payment is already captured, so a mail
        // failure must not 500 (that would make MP retry the whole notification).
        // Note: MP may deliver the same notification more than once — for one
        // product this can occasionally double-send; fine for MVP, revisit with
        // an order record if it becomes a problem.
        const md = (payment.metadata ?? {}) as Record<string, unknown>;
        const mdStr = (key: string): string | undefined => {
          // MP may return metadata keys snake_cased (as sent) or camelCased.
          const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          const v = md[key] ?? md[camel];
          return typeof v === "string" && v.length > 0 ? v : undefined;
        };
        const shippingName = mdStr("shipping_name");
        if (!shippingName) {
          // Sin shipping_name en el metadata, este "payment" no es una compra
          // única (esas siempre lo llevan) — es el cobro recurrente de una
          // suscripción, que ya llega por el topic subscription_authorized_payment
          // y manda sus propios correos ahí. Evita un correo de orden vacío/roto
          // y un duplicado del aviso de cobro.
          console.log("[mp-webhook] pago sin shipping metadata — se omite sendOrderEmails", {
            id: payment.id,
            reference: payment.external_reference,
          });
        } else {
          try {
            await sendOrderEmails({
              paymentId: payment.id,
              buyerEmail: payment.payer?.email,
              amount: payment.transaction_amount,
              reference: payment.external_reference,
              shipping: {
                name: shippingName,
                phone: mdStr("shipping_phone"),
                address: mdStr("shipping_address"),
                city: mdStr("shipping_city"),
                department: mdStr("shipping_department"),
                notes: mdStr("shipping_notes"),
              },
            });
          } catch (err) {
            console.error("[mp-webhook] no se pudieron enviar los correos", err);
          }
        }
      } else {
        console.log("[mp-webhook] actualización de pago", {
          id: payment.id,
          status: payment.status,
        });
      }
    } catch (error) {
      // Confirmamos con 200 igual: el pago ya está capturado y MP reenvía más
      // notificaciones. Devolver 500 además haría fallar el "Simular" del panel
      // (su id de ejemplo no es un pago real).
      console.error("[mp-webhook] no se pudo obtener el pago (se responde 200)", {
        dataId,
        error,
      });
    }
  }

  if (type === "subscription_preapproval" && dataId) {
    try {
      const preapproval = await preApprovalClient().get({ id: dataId });
      const status = mapPreapprovalStatus(preapproval.status);
      const db = getDb();

      let subscriber = (
        await db.select().from(subscribers).where(eq(subscribers.preapprovalId, dataId))
      )[0];
      // La primera notificación puede llegar antes de que /api/subscribe
      // termine de guardar el preapproval_id — reintentamos por external_reference
      // (que siempre es el id del subscriber).
      if (!subscriber && preapproval.external_reference) {
        subscriber = (
          await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.id, preapproval.external_reference))
        )[0];
      }

      if (!subscriber) {
        console.warn("[mp-webhook] subscription_preapproval sin subscriber asociado", { dataId });
      } else {
        const wasPending = subscriber.status === "pending";
        await db
          .update(subscribers)
          .set({
            status,
            preapprovalId: dataId,
            nextChargeAt: preapproval.next_payment_date
              ? new Date(preapproval.next_payment_date)
              : subscriber.nextChargeAt,
            updatedAt: new Date(),
          })
          .where(eq(subscribers.id, subscriber.id));

        if (wasPending && status === "active") {
          try {
            await sendSubscriptionWelcome({
              email: subscriber.email,
              name: subscriber.shippingName,
              address: subscriber.shippingAddress,
              city: subscriber.shippingCity,
              department: subscriber.shippingDepartment,
            });
          } catch (err) {
            console.error("[mp-webhook] no se pudo enviar la bienvenida de suscripción", err);
          }
        }
      }
    } catch (error) {
      console.error(
        "[mp-webhook] no se pudo procesar subscription_preapproval (se responde 200)",
        { dataId, error }
      );
    }
  }

  if (type === "subscription_authorized_payment" && dataId) {
    try {
      const invoice = await invoiceClient().get({ id: dataId });
      const preapprovalId = invoice.preapproval_id;

      if (!preapprovalId) {
        console.warn("[mp-webhook] subscription_authorized_payment sin preapproval_id", {
          dataId,
        });
      } else {
        const db = getDb();
        const subscriber = (
          await db.select().from(subscribers).where(eq(subscribers.preapprovalId, preapprovalId))
        )[0];

        if (!subscriber) {
          console.warn("[mp-webhook] subscription_authorized_payment sin subscriber asociado", {
            dataId,
            preapprovalId,
          });
        } else {
          const paymentStatus = invoice.payment?.status ?? invoice.status ?? "unknown";
          const mpPaymentId = invoice.payment?.id ? String(invoice.payment.id) : dataId;
          const amount =
            typeof invoice.transaction_amount === "number"
              ? Math.round(invoice.transaction_amount)
              : null;

          // MP reenvía notificaciones — sólo mandamos los correos si esta es
          // la primera vez que vemos este pago (insert real, no duplicado).
          const inserted = await db
            .insert(subscriptionCharges)
            .values({
              subscriberId: subscriber.id,
              mpPaymentId,
              amount,
              status: paymentStatus,
            })
            .onConflictDoNothing({ target: subscriptionCharges.mpPaymentId })
            .returning();

          if (inserted.length > 0) {
            if (paymentStatus === "approved") {
              try {
                await sendSubscriptionChargeOk({
                  email: subscriber.email,
                  name: subscriber.shippingName,
                });
              } catch (err) {
                console.error("[mp-webhook] no se pudo enviar la confirmación de cobro", err);
              }
              try {
                await sendOrderEmails({
                  paymentId: mpPaymentId,
                  // Sin buyerEmail: el cliente ya recibe sendSubscriptionChargeOk
                  // arriba — esto solo dispara el aviso a la tienda para que
                  // prepare el envío del mes.
                  amount,
                  reference: `Suscripción MICROCORE — ${subscriber.email}`,
                  shipping: {
                    name: subscriber.shippingName,
                    phone: subscriber.shippingPhone,
                    address: subscriber.shippingAddress,
                    city: subscriber.shippingCity,
                    department: subscriber.shippingDepartment,
                    notes: subscriber.shippingNotes ?? undefined,
                  },
                });
              } catch (err) {
                console.error("[mp-webhook] no se pudo avisar a la tienda del cobro", err);
              }
            } else if (paymentStatus === "rejected") {
              try {
                await sendSubscriptionChargeFailed({
                  email: subscriber.email,
                  name: subscriber.shippingName,
                });
              } catch (err) {
                console.error("[mp-webhook] no se pudo avisar el cobro fallido", err);
              }
            }
          } else {
            console.log("[mp-webhook] subscription_authorized_payment ya procesado (dedupe)", {
              dataId,
              mpPaymentId,
            });
          }

          // Best-effort: refrescamos next_charge_at con el dato más reciente
          // de la preapproval, si está disponible.
          try {
            const preapproval = await preApprovalClient().get({ id: preapprovalId });
            if (preapproval.next_payment_date) {
              await db
                .update(subscribers)
                .set({
                  nextChargeAt: new Date(preapproval.next_payment_date),
                  updatedAt: new Date(),
                })
                .where(eq(subscribers.id, subscriber.id));
            }
          } catch (err) {
            console.error("[mp-webhook] no se pudo refrescar next_charge_at", err);
          }
        }
      }
    } catch (error) {
      console.error(
        "[mp-webhook] no se pudo procesar subscription_authorized_payment (se responde 200)",
        { dataId, error }
      );
    }
  }

  return new NextResponse(null, { status: 200 });
}
