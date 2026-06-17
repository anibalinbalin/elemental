"use client";

/* ─────────────────────────────────────────────────────────────
 * NAVBAR — full-width cream bar adopted from the EB-web-02 Figma
 * (file Y6uMRyNeHviSdQt8eYcAtW, node 164:2). Replaces the old floating
 * dark-glass pill. Logo + section links + lime SHOP pill + cart, on a
 * sticky #fffff9 bar that sits above the hero. Gains a hairline + soft
 * shadow once the page is scrolled past the top.
 * ───────────────────────────────────────────────────────────── */

import Link from "next/link";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import ShoppingBag03Icon from "@hugeicons/core-free-icons/ShoppingBag03Icon";
import Menu01Icon from "@hugeicons/core-free-icons/Menu01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";

/* Figma nav order. Targets map to the real section ids in
 * landing-sections.tsx (#origen is added there alongside OriginStory). */
const LINKS = [
  { id: "microbiota", label: "Microbiota" },
  { id: "producto", label: "Producto" },
  { id: "ingredientes", label: "Ciencia" },
  { id: "producto", label: "Cómo funciona" },
  { id: "origen", label: "Origen" },
  { id: "blog", label: "Ciencia cotidiana" },
  { id: "comunidad", label: "Comunidad" },
];

const INK = "#171717";
const LIME = "#c7e94c";

/* EB monogram — composed from the Figma logo vectors: two interlocking
 * rings (164:298) with the stylised E (164:300) and B (164:303) glyphs
 * centred in each ring. currentColor so it inherits the link's text colour. */
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

function smoothTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
  return true;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (smoothTo(id)) e.preventDefault();
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-[#fffff9] transition-shadow duration-300 ${
        scrolled
          ? "border-b border-black/[0.06] shadow-[0_8px_24px_-18px_rgba(23,23,23,0.35)]"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Left: logo + links */}
        <div className="flex items-center gap-9 xl:gap-12">
          <Link href="/" aria-label="Elemental Bloom — inicio" className="shrink-0">
            <EbMark className="h-[26px] w-auto text-[#171717]" />
          </Link>
          <div className="hidden items-center gap-x-6 xl:gap-x-7 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={`#${l.id}`}
                onClick={(e) => go(e, l.id)}
                className="whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.04em] text-[#171717] transition-opacity duration-150 hover:opacity-55"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right: SHOP pill + cart + mobile toggle */}
        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href="#producto"
            onClick={(e) => go(e, "producto")}
            className="inline-flex h-9 items-center rounded-full px-5 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#1c2a10] transition-[transform,filter] duration-100 hover:brightness-[1.03] active:scale-[0.97]"
            style={{ backgroundColor: LIME }}
          >
            Shop
          </a>
          <Link
            href="#producto"
            aria-label="Ver producto"
            className="inline-flex h-9 w-9 items-center justify-center text-[#171717] transition-opacity duration-150 hover:opacity-60"
          >
            <HugeiconsIcon icon={ShoppingBag03Icon} size={22} strokeWidth={1.7} />
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center text-[#171717] lg:hidden"
          >
            <HugeiconsIcon icon={menuOpen ? Cancel01Icon : Menu01Icon} size={24} strokeWidth={1.8} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-black/[0.06] bg-[#fffff9] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-5 py-2 sm:px-6">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={`#${l.id}`}
                onClick={(e) => go(e, l.id)}
                className="py-3 text-sm font-medium uppercase tracking-[0.04em] text-[#171717]"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
