import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscribers } from "@/lib/schema";
import { verifyToken } from "@/lib/subscription-token";
import { PRODUCT, PLANS, formatPrice } from "@/lib/product";
import { SubscriptionManager, type SubscriberView } from "./subscription-manager";

export const metadata: Metadata = {
  title: "Mi suscripción — MICROCORE | Elemental Bloom",
  description: "Gestioná tu suscripción mensual a MICROCORE: estado, próximo cobro y cancelación.",
};

const CONTACT_EMAIL = "hola@elementalbloomco.com";

async function loadSubscriber(
  token: string | undefined
): Promise<{ subscriber: SubscriberView | null; tokenValid: boolean }> {
  if (!token) return { subscriber: null, tokenValid: false };

  const subscriberId = verifyToken(token);
  if (!subscriberId) return { subscriber: null, tokenValid: false };

  try {
    const db = getDb();
    const [row] = await db.select().from(subscribers).where(eq(subscribers.id, subscriberId));
    if (!row) return { subscriber: null, tokenValid: false };

    return {
      tokenValid: true,
      subscriber: {
        status: row.status,
        nextChargeAt: row.nextChargeAt ? row.nextChargeAt.toISOString() : null,
        address: row.shippingAddress,
        city: row.shippingCity,
        department: row.shippingDepartment,
      },
    };
  } catch (error) {
    console.error("[mi-suscripcion] no se pudo cargar el subscriber", error);
    return { subscriber: null, tokenValid: false };
  }
}

export default async function MiSuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const { subscriber, tokenValid } = await loadSubscriber(token);
  const expired = Boolean(token) && !tokenValid;

  return (
    <main className="bg-surface-1 text-foreground">
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
        <header className="mb-16">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Volver al inicio
          </Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Microcore · Suscripción
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Tu suscripción
          </h1>
          {!tokenValid ? (
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Ingresá tu email y te mandamos un enlace para gestionarla.
            </p>
          ) : null}
        </header>

        <SubscriptionManager
          tokenValid={tokenValid}
          expired={expired}
          token={tokenValid ? token : undefined}
          subscriber={subscriber}
          price={formatPrice(PLANS["30d"].unitPrice)}
        />

        <p className="mt-16 text-sm text-muted-foreground">
          ¿Algún problema? Escribinos a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-foreground underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
