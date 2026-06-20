"use client";

import React, { useState } from "react";
import { Sheet, Scroll } from "@silk-hq/components";
import { motion } from "framer-motion";
import { PRODUCT, formatPrice } from "@/lib/product";
import { URUGUAY_DEPARTMENTS, type ShippingDetails } from "@/lib/shipping";
import "./quiz-sheet.css";
import "./checkout-sheet.css";

/* Shipping-details sheet shown before redirecting to Mercado Pago.
 * Reuses the Silk + QuizSheet visual language (see quiz-sheet.css). */

const X_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const TAP_SPRING = { type: "spring" as const, stiffness: 500, damping: 25 };

const EMPTY: ShippingDetails = {
  name: "",
  phone: "",
  address: "",
  city: "",
  department: "",
  notes: "",
};

type Field = keyof ShippingDetails;
const REQUIRED: Field[] = ["name", "phone", "address", "city", "department"];

export function CheckoutSheet({
  presented,
  onPresentedChange,
  quantity = 1,
}: {
  presented?: boolean;
  onPresentedChange?: (presented: boolean) => void;
  quantity?: number;
}) {
  const [form, setForm] = useState<ShippingDetails>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = REQUIRED.every((f) => form[f].trim().length > 0);

  function set(field: Field, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, shipping: form }),
      });
      if (!res.ok) throw new Error(`checkout respondió ${res.status}`);
      const data: { init_point?: string } = await res.json();
      if (!data.init_point) throw new Error("falta init_point");
      window.location.href = data.init_point;
    } catch (err) {
      console.error("[checkout-sheet] checkout falló", err);
      setError("No se pudo continuar al pago. Revisá los datos e intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <Sheet.Root
      license="non-commercial"
      presented={presented}
      onPresentedChange={onPresentedChange}
    >
      <Sheet.Portal>
        <Sheet.View
          className="QuizSheet-view"
          contentPlacement="center"
          tracks="bottom"
          swipeOvershoot={false}
          nativeEdgeSwipePrevention={true}
          enteringAnimationSettings={{
            easing: "spring",
            stiffness: 480,
            damping: 45,
            mass: 1.5,
          }}
        >
          <Sheet.Backdrop className="QuizSheet-backdrop" themeColorDimming="auto" />
          <Sheet.Content className="QuizSheet-content" asChild>
            <Scroll.Root className="QuizSheet-scrollRoot" asChild>
              <Scroll.View
                className="QuizSheet-scrollView"
                onFocusInside={{ scrollIntoView: true }}
              >
                <Scroll.Content className="QuizSheet-scrollContent">
                  <div className="QuizSheet-innerContent">
                    <div className="CheckoutSheet-pad">
                      <div className="QuizSheet-topBar">
                        <div className="QuizSheet-backSpacer" />
                        <Sheet.Trigger action="dismiss" asChild>
                          <button
                            type="button"
                            className="QuizSheet-dismiss"
                            aria-label="Cerrar"
                          >
                            {X_SVG}
                          </button>
                        </Sheet.Trigger>
                      </div>

                      <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Datos de envío
                      </p>
                      <h2 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                        ¿A dónde te lo enviamos?
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {PRODUCT.deliveryEstimate}.
                      </p>

                      <form
                        className="CheckoutSheet-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submit();
                        }}
                      >
                        <FormField label="Nombre y apellido">
                          <input
                            className="QuizSheet-emailInput"
                            autoComplete="name"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                          />
                        </FormField>
                        <FormField label="Teléfono">
                          <input
                            className="QuizSheet-emailInput"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="09x xxx xxx"
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                          />
                        </FormField>
                        <FormField label="Dirección (calle y número)">
                          <input
                            className="QuizSheet-emailInput"
                            autoComplete="street-address"
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                          />
                        </FormField>
                        <div className="CheckoutSheet-row">
                          <FormField label="Ciudad / localidad">
                            <input
                              className="QuizSheet-emailInput"
                              autoComplete="address-level2"
                              value={form.city}
                              onChange={(e) => set("city", e.target.value)}
                            />
                          </FormField>
                          <FormField label="Departamento">
                            <select
                              className="QuizSheet-emailInput CheckoutSheet-select"
                              value={form.department}
                              onChange={(e) => set("department", e.target.value)}
                            >
                              <option value="" disabled>
                                Elegí…
                              </option>
                              {URUGUAY_DEPARTMENTS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </FormField>
                        </div>
                        <FormField label="Referencia / notas (opcional)">
                          <input
                            className="QuizSheet-emailInput"
                            placeholder="Apto, timbre, entre calles…"
                            value={form.notes}
                            onChange={(e) => set("notes", e.target.value)}
                          />
                        </FormField>

                        <div className="CheckoutSheet-summary">
                          <span>
                            {PRODUCT.title}
                            {quantity > 1 ? ` × ${quantity}` : ""}
                          </span>
                          <strong>{formatPrice(PRODUCT.unitPrice * quantity)}</strong>
                        </div>

                        {error ? (
                          <p role="alert" className="CheckoutSheet-error">
                            {error}
                          </p>
                        ) : null}

                        <motion.button
                          type="submit"
                          className="QuizSheet-btn QuizSheet-btnPrimary is-full"
                          disabled={!valid || loading}
                          aria-busy={loading}
                          whileTap={{ scale: 0.97 }}
                          transition={TAP_SPRING}
                        >
                          {loading ? "Redirigiendo…" : "Continuar al pago"}
                        </motion.button>
                        <p className="CheckoutSheet-secure">
                          Pago seguro con Mercado Pago
                        </p>
                      </form>
                    </div>
                  </div>
                </Scroll.Content>
              </Scroll.View>
            </Scroll.Root>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="CheckoutSheet-field">
      <span className="CheckoutSheet-label">{label}</span>
      {children}
    </label>
  );
}
