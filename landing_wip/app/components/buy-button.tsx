"use client";

import { useState } from "react";
import { CheckoutSheet } from "./checkout-sheet";

type BuyButtonProps = {
  className?: string;
  children: React.ReactNode;
};

// Opens the shipping-details sheet; the sheet collects the address and then
// redirects to Mercado Pago. Keeps the same className/children API so every
// existing call site (product card, quiz result) keeps working unchanged.
export function BuyButton({ className, children }: BuyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <CheckoutSheet
        presented={open}
        onPresentedChange={setOpen}
      />
    </>
  );
}
