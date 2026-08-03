import { NextResponse, type NextRequest } from "next/server";
import { preferenceClient } from "@/lib/mercadopago";
import { PRODUCT, PLANS, DEFAULT_PLAN, type PlanId } from "@/lib/product";
import { normalizeShipping } from "@/lib/shipping";

export const runtime = "nodejs";

function resolveBaseUrl(request: NextRequest): string {
  const fromEnv = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);

  const rawPlan = (body as { plan?: unknown })?.plan;
  const planId: PlanId =
    typeof rawPlan === "string" && rawPlan in PLANS
      ? (rawPlan as PlanId)
      : DEFAULT_PLAN;
  const plan = PLANS[planId];

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
  const isLocal = /localhost|127\.0\.0\.1/.test(baseUrl);

  try {
    const preference = await preferenceClient().create({
      body: {
        items: [
          {
            id: PRODUCT.id,
            title: `${PRODUCT.title} — ${plan.label}`,
            description: PRODUCT.description,
            quantity: plan.quantity,
            unit_price: plan.unitPrice,
            currency_id: PRODUCT.currencyId,
          },
        ],
        payer: {
          name: shipping.name,
          phone: { number: shipping.phone },
        },
        metadata: {
          shipping_name: shipping.name,
          shipping_phone: shipping.phone,
          shipping_address: shipping.address,
          shipping_city: shipping.city,
          shipping_department: shipping.department,
          shipping_notes: shipping.notes,
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          pending: `${baseUrl}/checkout/pending`,
          failure: `${baseUrl}/checkout/failure`,
        },
        ...(isLocal
          ? {}
          : {
              auto_return: "approved" as const,
              notification_url: `${baseUrl}/api/mercadopago/webhook`,
            }),
        external_reference: `microcore-${Date.now()}`,
        statement_descriptor: "ELEMENTAL BLOOM",
      },
    });

    return NextResponse.json({ init_point: preference.init_point });
  } catch (error) {
    console.error("[checkout] failed to create Mercado Pago preference", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Probá de nuevo en unos segundos." },
      { status: 502 }
    );
  }
}
