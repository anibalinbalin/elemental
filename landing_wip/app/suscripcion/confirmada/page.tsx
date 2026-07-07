import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT } from "@/lib/product";

export const metadata: Metadata = {
  title: "Suscripción activa — MICROCORE | Elemental Bloom",
  description: "Tu suscripción mensual a MICROCORE quedó activa.",
};

export default function SuscripcionConfirmadaPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center flex flex-col gap-6">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Microcore
        </span>
        <h1 className="text-3xl font-bold tracking-tight">
          Tu suscripción está activa.
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Te llega un correo de confirmación. El primer envío sale en breve.
        </p>
        <p className="text-sm text-muted-foreground">{PRODUCT.deliveryEstimate}.</p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="text-sm font-medium underline underline-offset-4"
          >
            Volver al inicio
          </Link>
          <Link
            href="/mi-suscripcion"
            className="text-sm font-medium underline underline-offset-4"
          >
            Gestionar suscripción
          </Link>
        </div>
      </div>
    </main>
  );
}
