"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";

export type SubscriberView = {
  status: string;
  nextChargeAt: string | null;
  address: string;
  city: string;
  department: string;
};

type Props = {
  tokenValid: boolean;
  expired: boolean;
  token?: string;
  subscriber: SubscriberView | null;
  price: string;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
  pending: "Pendiente de confirmación",
};

const inputClasses =
  "w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20";

const buttonClasses =
  "inline-flex items-center justify-center bg-foreground text-background px-8 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait";

export function SubscriptionManager({ tokenValid, expired, token, subscriber, price }: Props) {
  const shape = useShape();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [status, setStatus] = useState(subscriber?.status ?? null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await fetch("/api/subscription/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("No pudimos procesar el pedido. Probá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  async function handleCancel() {
    if (!token || cancelling) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo cancelar la suscripción.");
      setStatus("cancelled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar la suscripción.");
    } finally {
      setCancelling(false);
      setConfirmingCancel(false);
    }
  }

  if (sent) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Si existe una suscripción con ese email, te llegó un enlace. Revisá tu
        correo.
      </p>
    );
  }

  if (tokenValid && subscriber) {
    const nextCharge = subscriber.nextChargeAt
      ? new Intl.DateTimeFormat("es-UY", { dateStyle: "long" }).format(
          new Date(subscriber.nextChargeAt)
        )
      : null;
    const address = [subscriber.address, subscriber.city, subscriber.department]
      .filter(Boolean)
      .join(", ");

    if (status === "cancelled") {
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tu suscripción quedó cancelada. No se van a hacer más cobros. Podés
          volver a suscribirte cuando quieras.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-8">
        <dl className="divide-y divide-border">
          <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Estado</dt>
            <dd className="text-sm font-semibold">
              {STATUS_LABEL[status ?? ""] ?? status}
            </dd>
          </div>
          <div className="py-4 flex items-center justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Precio</dt>
            <dd className="text-sm font-semibold">{price} / mes</dd>
          </div>
          {nextCharge ? (
            <div className="py-4 flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Próximo cobro</dt>
              <dd className="text-sm font-semibold">{nextCharge}</dd>
            </div>
          ) : null}
          <div className="py-4 last:pb-0 flex items-center justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Dirección de envío</dt>
            <dd className="text-sm font-semibold text-right">{address}</dd>
          </div>
        </dl>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {confirmingCancel ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              ¿Seguro? Se cancela el próximo cobro. Podés volver cuando
              quieras.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className={cn(buttonClasses, shape.button)}
              >
                {cancelling ? "Cancelando…" : "Sí, cancelar"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingCancel(true)}
            className="self-start text-sm font-medium underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Cancelar suscripción
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {expired ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          El enlace venció. Pedí uno nuevo.
        </p>
      ) : null}
      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className={cn(inputClasses, shape.input, "sm:flex-1")}
        />
        <button
          type="submit"
          disabled={sending}
          className={cn(buttonClasses, shape.button)}
        >
          {sending ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
