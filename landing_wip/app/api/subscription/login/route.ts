import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscribers } from "@/lib/schema";
import { createToken } from "@/lib/subscription-token";
import { sendSubscriptionMagicLink } from "@/lib/email";

export const runtime = "nodejs";

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

  // Siempre respondemos 200 {ok:true}, exista o no la suscripción — no
  // confirmamos ni negamos si un email tiene cuenta.
  if (email) {
    try {
      const db = getDb();
      const [row] = await db
        .select()
        .from(subscribers)
        .where(and(eq(subscribers.email, email), inArray(subscribers.status, ["active", "paused"])))
        .orderBy(desc(subscribers.createdAt))
        .limit(1);

      if (row) {
        const token = createToken(row.id);
        const link = `${resolveBaseUrl(request)}/mi-suscripcion?token=${token}`;
        await sendSubscriptionMagicLink({ email: row.email, link });
      }
    } catch (error) {
      console.error("[subscription-login] no se pudo enviar el enlace de acceso", error);
    }
  }

  return NextResponse.json({ ok: true });
}
