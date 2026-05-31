"use client";

/* ─────────────────────────────────────────────────────────────
 * NAVBAR — floating dark-glass pill, hides on scroll-down / reveals on scroll-up.
 *
 * Material chosen via the ui.sh picker + interface-craft critique: a dark glass
 * pill (consistent across the dark hero AND the light blog pages). Opacity is
 * ~70% so it stays reliably dark over light backgrounds — at the hero-tuned 58%
 * it muddied to grey over #FAFAFA and white text fell below contrast.
 *
 * Motion (web-animation-design / Emil Kowalski):
 *   - transform: translateY only (GPU), will-change: transform
 *   - enters/exits the viewport → ease-out; reuse --ease-out-quint
 *   - show 300ms, hide 240ms (exit ~20% faster)
 *   - rAF-throttled, 8px delta threshold, always shown near the top
 *   - prefers-reduced-motion → stays shown (no auto-hide)
 * ───────────────────────────────────────────────────────────── */

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { QuizSheetTrigger } from "./quiz-sheet";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
];

export function useHideOnScroll({ threshold = 8, revealAtTop = 64 } = {}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    lastY.current = window.scrollY;

    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) > threshold) {
        if (reduceMq.matches || y < revealAtTop) {
          setHidden(false);
        } else {
          setHidden(delta > 0);
        }
        lastY.current = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, revealAtTop]);

  return hidden;
}

function navMotion(hidden: boolean): CSSProperties {
  return {
    transform: hidden ? "translateY(-100%)" : "translateY(0)",
    transition: `transform ${hidden ? 240 : 300}ms var(--ease-out-quint)`,
    willChange: "transform",
  };
}

export function NavbarPill() {
  const hidden = useHideOnScroll();
  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4"
      style={navMotion(hidden)}
    >
      <nav className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#171717]/70 p-1.5 shadow-[0_12px_34px_-14px_rgba(0,0,0,0.55)] backdrop-blur-[14px]">
        <Link
          href="/"
          className="rounded-lg px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Elemental
        </Link>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-2.5 text-sm text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            {l.label}
          </Link>
        ))}
        <QuizSheetTrigger asChild>
          <button
            type="button"
            className="ml-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-[#171717] transition-[transform,background-color] duration-100 hover:bg-white/90 active:scale-[0.97]"
          >
            Tu perfil
          </button>
        </QuizSheetTrigger>
      </nav>
    </div>
  );
}
