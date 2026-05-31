"use client";

import { useState } from "react";

type BuyButtonProps = {
  className?: string;
  quantity?: number;
  children: React.ReactNode;
};

export function BuyButton({ className, quantity = 1, children }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error(`checkout respondió ${res.status}`);
      const data: { init_point?: string } = await res.json();
      if (!data.init_point) throw new Error("falta init_point");
      window.location.href = data.init_point;
    } catch (err) {
      console.error("[buy-button] checkout falló", err);
      setError("No se pudo iniciar el pago. Probá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        aria-busy={loading}
        className={className}
      >
        {loading ? "Redirigiendo…" : children}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
