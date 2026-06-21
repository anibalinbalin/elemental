"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Sheet, Scroll } from "@silk-hq/components";
import { motion } from "framer-motion";
import { PRODUCT, formatPrice } from "@/lib/product";
import { URUGUAY_DEPARTMENTS, type ShippingDetails } from "@/lib/shipping";
import "./quiz-sheet.css";
import "./checkout-sheet.css";

/* Shipping-details sheet shown before redirecting to Mercado Pago.
 * Silk layout mirrors the proven LongSheet recipe (centered, above navbar,
 * click-outside to dismiss); field/button styles reuse quiz-sheet.css. */

const X_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const LOCK_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <rect x="4" y="10" width="16" height="11" rx="2.5" strokeWidth="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* EB monogram — same vectors as the navbar logo, inlined so the sheet reads
 * as a real Elemental Bloom checkout. */
function EbMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 63.56 34.34"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path d="M58.54 5.07C55.29 1.81 50.95 0.01 46.35 0C40.22 0 34.82 3.24 31.78 8.08C31.1 7 30.3 5.99 29.37 5.07C26.12 1.81 21.78 0.01 17.18 0C7.73004 0 0.020039 7.67 3.8974e-05 17.1C-0.019961 26.58 7.66004 34.31 17.11 34.34C21.68 34.34 26.01 32.56 29.29 29.33C30.25 28.38 31.07 27.34 31.77 26.22C34.8 31.07 40.16 34.32 46.28 34.33C50.85 34.33 55.18 32.55 58.46 29.32C61.73 26.07 63.55 21.74 63.56 17.16C63.56 12.59 61.79 8.3 58.54 5.05V5.07ZM29.18 17.9C28.87 23.31 24.19 29.14 17.19 29.14H17C10.45 29.04 5.16004 23.65 5.18004 17.12C5.20004 13.87 6.45004 10.85 8.71004 8.6C10.94 6.39 13.94 5.17 17.15 5.17C20.34 5.09 23.46 6.39 25.76 8.77C27.82 10.88 29.02 13.67 29.18 16.56C29.18 16.74 29.17 16.91 29.16 17.09C29.16 17.32 29.16 17.55 29.18 17.78C29.18 17.82 29.18 17.85 29.18 17.89V17.9ZM58.35 17.9C58.04 23.31 53.36 29.14 46.36 29.14H46.17C39.81 29.04 34.65 23.95 34.38 17.68C34.38 17.51 34.39 17.34 34.39 17.16C34.39 16.97 34.39 16.78 34.38 16.59C34.52 13.54 35.74 10.72 37.88 8.6C40.11 6.39 43.11 5.17 46.32 5.17C49.51 5.09 52.63 6.39 54.93 8.77C57.3 11.21 58.54 14.53 58.35 17.89V17.9Z" />
      <g transform="translate(12.9 12.3)">
        <path d="M0 6.96V7.13C0 8.6 1.19 9.79 2.66 9.8L8.11 9.82V8.27H2.85C2.13 8.27 1.55 7.69 1.55 6.97C1.55 6.25 2.13 5.67 2.85 5.67H8.11V4.15H2.81C1.26 4.15 0.00999451 5.41 0.00999451 6.95L0 6.96Z" />
        <path d="M0 2.81V2.98C0 4.45 1.19 5.64 2.66 5.65L8.11 5.67V4.12H2.85C2.13 4.12 1.55 3.54 1.55 2.82C1.55 2.1 2.13 1.52 2.85 1.52H8.11V0H2.81C1.26 0 0.00999451 1.26 0.00999451 2.8L0 2.81Z" />
      </g>
      <g transform="translate(42.7 12.3)">
        <path d="M8.2 2.86V2.69C8.2 1.22 7.01 0.0300005 5.54 0.0200005L0.0899963 0V1.55H5.35C6.07 1.55 6.65 2.13 6.65 2.85C6.65 3.57 6.07 4.15 5.35 4.15H0.0899963V5.67H5.39C6.94 5.67 8.19 4.41 8.19 2.87L8.2 2.86Z" />
        <path d="M8.2 7.01V6.84C8.2 5.37 7.01 4.18 5.54 4.17L0.0899963 4.15V5.7H5.35C6.07 5.7 6.65 6.28 6.65 7C6.65 7.72 6.07 8.3 5.35 8.3H0.0899963V9.82H5.39C6.94 9.82 8.19 8.56 8.19 7.02L8.2 7.01Z" />
        <path d="M1.58 0.0400009H0V9.77H1.58V0.0400009Z" />
      </g>
    </svg>
  );
}

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

  // Silk track: switch to "top" once the user scrolls a tall card, so the
  // swipe-to-dismiss anchor follows; reset to "bottom" when resting outside.
  const [track, setTrack] = useState<"top" | "bottom">("bottom");
  const [restingOutside, setRestingOutside] = useState(false);
  const catcherRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (restingOutside) setTrack("bottom");
  }, [restingOutside]);

  // Click-outside-to-close via a native listener on the catcher (Silk's Scroll
  // can swallow React's delegated click before it reaches the root).
  useEffect(() => {
    const el = catcherRef.current;
    if (!el || !onPresentedChange) return;
    const onClick = () => onPresentedChange(false);
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [onPresentedChange]);

  const scrollHandler = useCallback(
    ({ progress }: { progress: number }) => {
      if (restingOutside) return;
      setTrack(progress < 0.5 ? "bottom" : "top");
    },
    [restingOutside]
  );

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
          className="CheckoutSheet-view"
          contentPlacement="center"
          tracks={track}
          swipeOvershoot={false}
          nativeEdgeSwipePrevention={true}
          enteringAnimationSettings={{
            easing: "spring",
            stiffness: 480,
            damping: 45,
            mass: 1.5,
          }}
          onTravelStatusChange={(status) =>
            setRestingOutside(status === "idleOutside")
          }
        >
          <Sheet.Backdrop className="CheckoutSheet-backdrop" themeColorDimming="auto" />
          <Sheet.Content className="CheckoutSheet-content" asChild>
            <Scroll.Root
              className="CheckoutSheet-scrollRoot"
              componentRef={scrollRef}
              asChild
            >
              <Scroll.View
                className="CheckoutSheet-scrollView"
                onScroll={scrollHandler}
                onFocusInside={{ scrollIntoView: true }}
              >
                <Scroll.Content className="CheckoutSheet-scrollContent">
                  <div
                    ref={catcherRef}
                    className="CheckoutSheet-clickOutsideCatcher"
                    aria-hidden="true"
                  />
                  <div className="CheckoutSheet-card">
                    <div className="CheckoutSheet-pad">
                      <div className="QuizSheet-topBar">
                        <div className="CheckoutSheet-brand">
                          <EbMark className="CheckoutSheet-mark" />
                          <span className="CheckoutSheet-step">
                            Paso 1 de 2 · Envío
                          </span>
                        </div>
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

                      <h2 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                        ¿A dónde te lo enviamos?
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {PRODUCT.deliveryEstimate} ·{" "}
                        <span className="CheckoutSheet-free">envío sin costo</span>
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
                          <div className="CheckoutSheet-sumRow">
                            <span>
                              {PRODUCT.title}
                              {quantity > 1 ? ` × ${quantity}` : ""}
                            </span>
                            <span>{formatPrice(PRODUCT.unitPrice * quantity)}</span>
                          </div>
                          <div className="CheckoutSheet-sumRow">
                            <span>Envío a todo Uruguay</span>
                            <span className="CheckoutSheet-free">Gratis</span>
                          </div>
                          <div className="CheckoutSheet-sumRow CheckoutSheet-sumTotal">
                            <strong>Total</strong>
                            <strong>
                              {formatPrice(PRODUCT.unitPrice * quantity)}
                            </strong>
                          </div>
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
                          <span className="CheckoutSheet-lock">{LOCK_SVG}</span>
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
