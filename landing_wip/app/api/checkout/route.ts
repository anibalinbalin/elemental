import { NextResponse, type NextRequest } from "next/server";
import { preferenceClient } from "@/lib/mercadopago";
import { PRODUCT } from "@/lib/product";
import { normalizeShipping } from "@/lib/shipping";

export const runtime = "nodejs";

function resolveBaseUrl(request: NextRequest): string {
  const fromEnv = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);

  const quantity = Math.min(
    PRODUCT.maxQuantity,
    Math.max(1, Math.floor(Number((body as { quantity?: unknown })?.quantity) || 1))
  );

  // Shipping address is required: the product is physical and we fulfill it
  // ourselves, so we must capture where to send it before taking payment.
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
  // Mercado Pago can't reach localhost, and rejects auto_return to a
  // non-public URL — so we only wire those up on a real domain.
  const isLocal = /localhost|127\.0\.0\.1/.test(baseUrl);

  try {
    const preference = await preferenceClient().create({
      body: {
        items: [
          {
            id: PRODUCT.id,
            title: PRODUCT.title,
            description: PRODUCT.description,
            quantity,
            unit_price: PRODUCT.unitPrice,
            currency_id: PRODUCT.currencyId,
          },
        ],
        payer: {
          name: shipping.name,
          phone: { number: shipping.phone },
        },
        // Source of truth for the shipping address: returned verbatim on the
        // payment, read by the webhook to build the store's order email.
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
