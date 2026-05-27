"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import ShoppingBag01Icon from "@hugeicons/core-free-icons/ShoppingBag01Icon";
import { useShape } from "@/lib/shape-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Microbiota", href: "#microbiota" },
  { label: "Producto", href: "#producto" },
  { label: "Ciencia", href: "#ciencia" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Origen", href: "#origen" },
  { label: "Ciencia cotidiana", href: "#ciencia-cotidiana" },
  { label: "Comunidad", href: "#comunidad" },
  { label: "Shop", href: "#shop" },
];

export function Nav() {
  const shape = useShape();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-surface-3/80 backdrop-blur-xl",
        "border-b border-border"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <a href="#" className="text-xl font-bold tracking-tight">
          EB
        </a>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          className={cn(
            "w-10 h-10 flex items-center justify-center",
            "hover:bg-hover transition-colors",
            shape.button
          )}
          aria-label="Carrito"
        >
          <HugeiconsIcon
            icon={ShoppingBag01Icon}
            size={20}
            strokeWidth={1.5}
          />
        </button>
      </nav>
    </header>
  );
}
