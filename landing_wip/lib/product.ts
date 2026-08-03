export const PRODUCT = {
  id: "microcore-300g",
  title: "MICROCORE — 300 g",
  description: "Una sola cucharada. Cinco funciones. Sin cápsulas.",
  currencyId: "UYU" as const,
  image: "/images/product-pouch.webp",
  deliveryEstimate: "Llega en 2 a 5 días hábiles a todo Uruguay",
} as const;

export type PlanId = "15d" | "30d";

export const PLANS: Record<PlanId, { label: string; quantity: number; unitPrice: number }> = {
  "15d": { label: "15 días", quantity: 1, unitPrice: 1890 },
  "30d": { label: "30 días", quantity: 2, unitPrice: 1590 },
};

export const DEFAULT_PLAN: PlanId = "30d";

export const UNIT_PRICE = PLANS["15d"].unitPrice;

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: PRODUCT.currencyId,
    maximumFractionDigits: 0,
  }).format(value);
}
