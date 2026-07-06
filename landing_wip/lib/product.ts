// Single source of truth for the product being sold.
// Price is in UYU (Uruguayan pesos).
export const PRODUCT = {
  id: "microcore-300g",
  title: "MICROCORE — 300 g",
  description: "Una sola cucharada. Cinco funciones. Sin cápsulas.",
  unitPrice: 1890, // UYU
  launchPrice: 1490, // UYU — precio de lanzamiento (solo compra única)
  subscriptionPrice: 1590, // UYU — suscripción mensual (-16% vs lista)
  portions: 15, // porciones por doypack de 300 g
  currencyId: "UYU",
  maxQuantity: 10,
  image: "/images/product-pouch.webp",
  // Customer-facing delivery promise. Shown on the product card, checkout
  // form, success page and emails. TODO: confirmar el plazo/cobertura reales.
  deliveryEstimate: "Llega en 2 a 5 días hábiles a todo Uruguay",
} as const;

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: PRODUCT.currencyId,
    maximumFractionDigits: 0,
  }).format(value);
}

// Precio de lanzamiento: se activa con NEXT_PUBLIC_LAUNCH_MODE=true (env de
// Vercel + redeploy, sin tocar código). NEXT_PUBLIC_ para que el mismo flag
// quede inlined en el cliente y sea legible en el server.
export const LAUNCH_MODE = process.env.NEXT_PUBLIC_LAUNCH_MODE === "true";

export function currentUnitPrice(): number {
  return LAUNCH_MODE ? PRODUCT.launchPrice : PRODUCT.unitPrice;
}

// La suscripción no participa del precio de lanzamiento: 1590 fijo
// ("precio congelado" es parte de la promesa del plan).
export function subscriptionPricePerPortion(): number {
  return Math.round(PRODUCT.subscriptionPrice / PRODUCT.portions);
}
