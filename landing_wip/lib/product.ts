// Single source of truth for the product being sold.
// Price is in UYU (Uruguayan pesos).
export const PRODUCT = {
  id: "microcore-300g",
  title: "MICROCORE — 300 g",
  description: "Una sola cucharada. Cinco funciones. Sin cápsulas.",
  unitPrice: 1890, // UYU
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
