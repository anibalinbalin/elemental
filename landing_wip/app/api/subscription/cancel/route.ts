import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscribers } from "@/lib/schema";
import { verifyToken } from "@/lib/subscription-token";
import { preApprovalClient } from "@/lib/mercadopago";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const token = String((body as { token?: unknown })?.token ?? "");

  const subscriberId = verifyToken(token);
  if (!subscriberId) {
    return NextResponse.json(
      { error: "El enlace venció o no es válido. Pedí uno nuevo." },
      { status: 401 }
    );
  }

  const db = getDb();
  const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, subscriberId));
  if (!subscriber) {
    return NextResponse.json(
      { error: "El enlace venció o no es válido. Pedí uno nuevo." },
      { status: 401 }
    );
  }

  if (subscriber.status !== "active" && subscriber.status !== "paused") {
    return NextResponse.json({ ok: true, status: subscriber.status });
  }

  try {
    if (subscriber.preapprovalId) {
      await preApprovalClient().update({
        id: subscriber.preapprovalId,
        body: { status: "cancelled" },
      });
    }
  } catch (error) {
    console.error("[subscription-cancel] no se pudo cancelar en Mercado Pago", error);
    return NextResponse.json(
      { error: "No se pudo cancelar la suscripción. Probá de nuevo en unos segundos." },
      { status: 502 }
    );
  }

  await db
    .update(subscribers)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscribers.id, subscriber.id));

  return NextResponse.json({ ok: true, status: "cancelled" });
}
