import Link from "next/link";

type CheckoutResultProps = {
  variant: "success" | "pending" | "failure";
  paymentId?: string;
};

const COPY = {
  success: {
    title: "¡Gracias por tu compra!",
    message:
      "Tu pago fue aprobado. Te enviamos la confirmación por correo y preparamos tu pedido.",
  },
  pending: {
    title: "Pago en proceso",
    message:
      "Tu pago quedó pendiente de confirmación. Te avisamos por correo apenas se acredite.",
  },
  failure: {
    title: "No pudimos procesar el pago",
    message:
      "El pago no se completó y no se hizo ningún cargo. Podés intentar de nuevo cuando quieras.",
  },
} as const;

export function CheckoutResult({ variant, paymentId }: CheckoutResultProps) {
  const { title, message } = COPY[variant];

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center flex flex-col gap-6">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Microcore
        </span>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">{message}</p>
        {paymentId ? (
          <p className="text-xs font-mono text-muted-foreground">
            Referencia de pago: {paymentId}
          </p>
        ) : null}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="text-sm font-medium underline underline-offset-4"
          >
            Volver al inicio
          </Link>
          {variant !== "success" ? (
            <Link
              href="/#comprar"
              className="text-sm font-medium underline underline-offset-4"
            >
              Reintentar compra
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
