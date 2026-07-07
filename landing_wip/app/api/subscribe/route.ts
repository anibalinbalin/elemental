import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { preApprovalClient } from "@/lib/mercadopago";
import { PRODUCT } from "@/lib/product";
import { normalizeShipping } from "@/lib/shipping";
import { getDb } from "@/lib/db";
import { subscribers } from "@/lib/schema";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveBaseUrl(request: NextRequest): string {
  const fromEnv = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);

  const email = String((body as { email?: unknown })?.email ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "El email no es válido. Revisalo e intentá de nuevo." },
      { status: 400 }
    );
  }

  // La suscripción es un producto físico que fulfillamos nosotros, así que
  // necesitamos la dirección de envío antes de crear el cobro recurrente.
  const shipping = normalizeShipping((body as { shipping?: unknown })?.shipping);
  if (!shipping) {
    return NextResponse.json(
      {
        error:
          "Faltan datos de envío. Completá nombre, teléfono, dirección, ciudad y departamento.",
      },
      { status: 400 }
    );
  }

  const baseUrl = resolveBaseUrl(request);
  // A diferencia de una Preference, MP siempre exige un back_url público para
  // crear una Preapproval — no hay modo "sin auto_return" para probar en
  // localhost. Sin APP_URL apuntando a un dominio real, no podemos crear la
  // suscripción.
  if (/localhost|127\.0\.0\.1/.test(baseUrl)) {
    console.error(
      "[subscribe] APP_URL no está definido y el origin es localhost — Mercado Pago rechaza back_url no públicas."
    );
    return NextResponse.json(
      {
        error:
          "No se pudo iniciar la suscripción en este entorno. Probá contra un dominio público (definí APP_URL).",
      },
      { status: 500 }
    );
  }

  const db = getDb();
  const [row] = await db
    .insert(subscribers)
    .values({
      email,
      status: "pending",
      shippingName: shipping.name,
      shippingPhone: shipping.phone,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingDepartment: shipping.department,
      shippingNotes: shipping.notes || null,
    })
    .returning();

  try {
    const preapproval = await preApprovalClient().create({
      body: {
        reason: "MICROCORE — Suscripción mensual",
        external_reference: row.id,
        payer_email: email,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: PRODUCT.subscriptionPrice,
          currency_id: PRODUCT.currencyId,
        },
        back_url: `${baseUrl}/suscripcion/confirmada`,
        status: "pending",
      },
    });

    await db
      .update(subscribers)
      .set({ preapprovalId: preapproval.id, updatedAt: new Date() })
      .where(eq(subscribers.id, row.id));

    return NextResponse.json({ init_point: preapproval.init_point });
  } catch (error) {
    console.error("[subscribe] failed to create Mercado Pago preapproval", error);
    await db
      .update(subscribers)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(subscribers.id, row.id));
    return NextResponse.json(
      { error: "No se pudo iniciar la suscripción. Probá de nuevo en unos segundos." },
      { status: 502 }
    );
  }
}
