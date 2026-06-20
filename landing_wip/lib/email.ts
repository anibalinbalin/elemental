import { Resend } from "resend";
import { PRODUCT, formatPrice } from "./product";

// Server-only. Sends order emails on an approved payment.

const STORE_EMAIL = "hola@elementalbloomco.com";
const FROM = `Elemental Bloom <${STORE_EMAIL}>`;

export type ShippingInfo = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  notes?: string;
};

export type OrderInfo = {
  paymentId: string | number | undefined;
  buyerEmail?: string | null;
  amount?: number | null;
  reference?: string | null;
  shipping?: ShippingInfo;
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendOrderEmails(order: OrderInfo): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY sin definir — no se envían correos.");
    return;
  }

  const amountLabel =
    typeof order.amount === "number" ? formatPrice(order.amount) : "—";
  const ref = String(order.reference ?? order.paymentId ?? "—");
  // Idempotency anchor: the same payment never sends a given email twice, even
  // if MP retries the notification or a valid one is replayed (Resend dedupes by
  // this key for 24h). This is our replay/duplicate defense — see the webhook.
  const idem = String(order.paymentId ?? ref);

  // 1) Confirmation to the buyer.
  if (order.buyerEmail) {
    const { error } = await resend.emails.send(
      {
        from: FROM,
        to: order.buyerEmail,
        replyTo: STORE_EMAIL,
        subject: "Confirmación de tu compra — MICROCORE",
        html: buyerHtml(amountLabel, ref, order.shipping),
      },
      { idempotencyKey: `microcore-buyer-${idem}` }
    );
    if (error) {
      console.error("[email] fallo al enviar confirmación al cliente", error);
    }
  }

  // 2) Heads-up to the store.
  const { error: storeError } = await resend.emails.send(
    {
      from: FROM,
      to: STORE_EMAIL,
      subject: `Nueva orden — MICROCORE (${ref})`,
      html: storeHtml({ ...order, amountLabel, ref }),
    },
    { idempotencyKey: `microcore-store-${idem}` }
  );
  if (storeError) {
    console.error("[email] fallo al enviar aviso a la tienda", storeError);
  }
}

const SHELL_OPEN = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:8px 4px;color:#1a1a1a;line-height:1.6">`;
const LABEL = `<p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#999;margin:0 0 8px">Elemental Bloom</p>`;
const FOOTER = `<p style="color:#999;font-size:12px;margin-top:32px">Elemental Bloom · Uruguay</p></div>`;

// Escape any value interpolated into email HTML. buyerEmail comes from the
// payer, so treat all dynamic values as untrusted.
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;color:#666;font-size:14px">${esc(label)}</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px">${esc(value)}</td></tr>`;
}

function shippingTo(s: ShippingInfo | undefined): string {
  if (!s) return "";
  const line = [s.address, s.city, s.department].filter(Boolean).join(", ");
  return line;
}

function buyerHtml(amountLabel: string, ref: string, shipping?: ShippingInfo): string {
  const dest = shippingTo(shipping);
  const shipBlock = dest
    ? `<p style="margin:0 0 20px">Lo enviamos a <strong>${esc(dest)}</strong>. ${esc(
        PRODUCT.deliveryEstimate
      )}.</p>`
    : `<p style="margin:0 0 20px">${esc(PRODUCT.deliveryEstimate)}.</p>`;
  return `${SHELL_OPEN}${LABEL}
    <h1 style="font-size:24px;margin:0 0 12px">¡Gracias por tu compra!</h1>
    <p style="margin:0 0 20px">Tu pago fue aprobado y ya estamos preparando tu pedido de <strong>${esc(PRODUCT.title)}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:0 0 20px">
      ${row("Producto", PRODUCT.title)}
      ${row("Total", amountLabel)}
      ${row("Referencia", ref)}
    </table>
    ${shipBlock}
    <p style="margin:0">Te avisamos por este correo cuando lo despachemos. Cualquier duda, respondé este mail.</p>
    ${FOOTER}`;
}

function storeHtml(o: OrderInfo & { amountLabel: string; ref: string }): string {
  const s = o.shipping;
  const shippingTable = s
    ? `<h2 style="font-size:16px;margin:18px 0 8px">Datos de envío</h2>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:0 0 12px">
      ${row("Nombre", s.name ?? "—")}
      ${row("Teléfono", s.phone ?? "—")}
      ${row("Dirección", s.address ?? "—")}
      ${row("Ciudad", s.city ?? "—")}
      ${row("Departamento", s.department ?? "—")}
      ${s.notes ? row("Notas", s.notes) : ""}
    </table>`
    : `<p style="margin:8px 0 12px;color:#b45309;font-size:13px">⚠ Esta orden no trae datos de envío — contactá al cliente.</p>`;
  return `${SHELL_OPEN}${LABEL}
    <h1 style="font-size:22px;margin:0 0 12px">Nueva orden de MICROCORE</h1>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:0 0 12px">
      ${row("Cliente", o.buyerEmail ?? "—")}
      ${row("Total", o.amountLabel)}
      ${row("Pago (id)", String(o.paymentId ?? "—"))}
      ${row("Referencia", o.ref)}
    </table>
    ${shippingTable}
    <p style="margin:0;color:#666;font-size:13px">Preparar y despachar el pedido.</p>
    ${FOOTER}`;
}
