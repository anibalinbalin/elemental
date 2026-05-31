import { NextResponse, type NextRequest } from "next/server";
import { preferenceClient } from "@/lib/mercadopago";
import { PRODUCT } from "@/lib/product";

export const runtime = "nodejs";

function resolveBaseUrl(request: NextRequest): string {
  const fromEnv = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  let quantity = 1;
  try {
    const body = await request.json().catch(() => ({}));
    quantity = Math.min(
      PRODUCT.maxQuantity,
      Math.max(1, Math.floor(Number(body?.quantity) || 1))
    );
  } catch {
    quantity = 1;
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
