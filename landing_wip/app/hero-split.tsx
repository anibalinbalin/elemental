"use client";

import { ScienceBadge } from "./components/science-badge";

/**
 * Split hero — green key art (EB-1) bleeds across the left ~71%, the cream
 * surface continues on the right, and the MICROKORE pouch straddles the seam
 * with the lime science seal at its base. White headline + outline CTA sit
 * over the green.
 *
 * Plain <img> (not next/image) keeps the optimized webp out of the Vercel
 * image proxy. The bottom is barely rounded + soft-shadowed so it reads as a
 * distinct block while the same #fffff9 continues into the sections below.
 */
function scrollToProducto() {
  document.getElementById("producto")?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSplit() {
  return (
    <section className="relative isolate overflow-hidden bg-[#fffff9] rounded-b-[28px] shadow-[0_24px_50px_-32px_rgba(23,23,23,0.18)]">
      {/* GREEN PANEL — full-bleed on mobile, left 71% on desktop. */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[71%]">
        <img
          src="/images/hero-eb-green.webp"
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        {/* Left-edge scrim for white-text legibility (desktop). */}
        <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(to_right,rgba(12,38,18,0.42),rgba(12,38,18,0.10)_42%,transparent_72%)]" />
        {/* Top-down scrim (mobile, where text spans full width). */}
        <div className="absolute inset-0 lg:hidden bg-[linear-gradient(to_bottom,rgba(10,30,15,0.46),rgba(10,30,15,0.14)_55%,rgba(10,30,15,0.05))]" />
      </div>

      {/* POUCH — desktop: absolute, straddling the green/cream seam, with
          white breathing room (and the overhanging badge) kept in frame. */}
      <div className="absolute right-[6%] top-1/2 hidden -translate-y-1/2 lg:block xl:right-[8%] z-20">
        <div className="relative w-fit">
          <img
            src="/images/microkore-pouch.webp"
            alt="Pouch de MICROKORE, probiótico termorresistente en polvo"
            className="h-[clamp(440px,78vh,840px)] w-auto rotate-[2.5deg] drop-shadow-[0_34px_50px_rgba(18,42,20,0.30)]"
          />
          <ScienceBadge className="absolute bottom-[7%] right-[-10px] w-[150px]" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl flex-col justify-center px-6 py-24 sm:px-8 lg:px-10 lg:py-0">
        <div className="max-w-[34rem]">
          <h1 className="font-bold leading-[0.97] tracking-[-0.03em] text-white text-[2.6rem] sm:text-[3.5rem] lg:text-7xl xl:text-[5.25rem]">
            Ciencia aplicada
            <br />
            al bienestar
            <br />
            cotidiano
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
            Fórmulas funcionales para tu microbiota, con dosis claras y
            diseñadas para integrarse a tu comida diaria.
          </p>
          <button
            type="button"
            onClick={scrollToProducto}
            className="mt-9 inline-flex h-12 items-center rounded-full border border-white/55 px-7 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-white hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Quiero empezar
          </button>
        </div>

        {/* POUCH — mobile: in flow, below the copy. */}
        <div className="mt-12 flex justify-center lg:hidden">
          <div className="relative w-fit">
            <img
              src="/images/microkore-pouch.webp"
              alt="Pouch de MICROKORE, probiótico termorresistente en polvo"
              className="h-[44vh] max-h-[420px] w-auto rotate-[2.5deg] drop-shadow-[0_26px_40px_rgba(18,42,20,0.32)]"
            />
            <ScienceBadge className="absolute bottom-[6%] right-[-6px] w-[96px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
