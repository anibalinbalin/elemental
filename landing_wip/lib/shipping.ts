// Shared shipping-details contract for checkout.
// Used by the client form, the checkout API (validation), and the
// webhook/email (display). Keep client + server in sync via this file.

export type ShippingDetails = {
  name: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  notes: string;
};

// Uruguay's 19 departamentos — the only coverage we ship to.
export const URUGUAY_DEPARTMENTS = [
  "Artigas",
  "Canelones",
  "Cerro Largo",
  "Colonia",
  "Durazno",
  "Flores",
  "Florida",
  "Lavalleja",
  "Maldonado",
  "Montevideo",
  "Paysandú",
  "Río Negro",
  "Rivera",
  "Rocha",
  "Salto",
  "San José",
  "Soriano",
  "Tacuarembó",
  "Treinta y Tres",
] as const;

const MAX = {
  name: 80,
  phone: 30,
  address: 160,
  city: 60,
  department: 40,
  notes: 280,
} as const;

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Server-side: validate + normalize untrusted input. Returns null when any
// required field is missing or the department isn't a real one, so the caller
// can reject the request before creating a payment.
export function normalizeShipping(input: unknown): ShippingDetails | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;

  const shipping: ShippingDetails = {
    name: clip(r.name, MAX.name),
    phone: clip(r.phone, MAX.phone),
    address: clip(r.address, MAX.address),
    city: clip(r.city, MAX.city),
    department: clip(r.department, MAX.department),
    notes: clip(r.notes, MAX.notes),
  };

  const required = [
    shipping.name,
    shipping.phone,
    shipping.address,
    shipping.city,
    shipping.department,
  ];
  if (required.some((v) => v.length === 0)) return null;
  if (!URUGUAY_DEPARTMENTS.includes(shipping.department as (typeof URUGUAY_DEPARTMENTS)[number]))
    return null;

  return shipping;
}
