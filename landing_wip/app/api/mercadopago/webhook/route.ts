import { NextResponse, type NextRequest } from "next/server";
import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";
import { paymentClient } from "@/lib/mercadopago";
import { sendOrderEmails } from "@/lib/email";

export const runtime = "nodejs";

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
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret,
        toleranceSeconds: 300,
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
        try {
          await sendOrderEmails({
            paymentId: payment.id,
            buyerEmail: payment.payer?.email,
            amount: payment.transaction_amount,
            reference: payment.external_reference,
          });
        } catch (err) {
          console.error("[mp-webhook] no se pudieron enviar los correos", err);
        }
      } else {
        console.log("[mp-webhook] actualización de pago", {
          id: payment.id,
          status: payment.status,
        });
      }
    } catch (error) {
      console.error("[mp-webhook] no se pudo obtener el pago", { dataId, error });
      // 500 → Mercado Pago reintenta la notificación.
      return new NextResponse(null, { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
