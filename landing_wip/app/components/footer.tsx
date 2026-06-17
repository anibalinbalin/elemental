"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import InstagramIcon from "@hugeicons/core-free-icons/InstagramIcon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import { SectionReveal } from "./section-reveal";
import { QuizSheetTrigger } from "./quiz-sheet";

// EB-web-02 Figma footer: full-width lime (#c8f670) panel with rounded top
// corners (square bottom), dark olive ink — same lime/ink pairing as the
// testimonial block. Newsletter signup top-left, two nav columns top-right,
// and a giant full-bleed "elemental bloom" wordmark across the bottom.
const LIME = "#c8f670";
const INK = "#1c2a10";

const siteNav = [
  { label: "MICROBIOTA", href: "#microbiota" },
  { label: "PRODUCTO", href: "#producto" },
  { label: "CIENCIA", href: "#ciencia-cotidiana" },
  { label: "CÓMO FUNCIONA", href: "#como-funciona" },
  { label: "ORÍGEN", href: "#origen" },
  { label: "COMUNIDAD", href: "#comunidad" },
];

const legalNav = [
  { label: "TÉRMINOS", href: "/ayuda#terminos" },
  { label: "GARANTÍA", href: "/ayuda#garantia" },
  { label: "ENVÍOS", href: "/ayuda#envios" },
  { label: "FAQ", href: "/ayuda#faq" },
];

const socials = [
  {
    icon: InstagramIcon,
    label: "Instagram",
    href: "https://www.instagram.com/elementalbloomco",
    external: true,
  },
  {
    icon: Mail01Icon,
    label: "Email",
    href: "mailto:hola@elementalbloomco.com",
    external: false,
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer>
      <div
        className="overflow-hidden rounded-t-[3rem] lg:rounded-t-[3.5rem]"
        style={{ backgroundColor: LIME, color: INK }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-10 lg:px-14 lg:pt-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
            {/* Newsletter signup */}
            <SectionReveal className="w-full max-w-md">
              <p className="text-xl font-medium sm:text-2xl">
                Lo que se viene, primero acá
              </p>
              {status === "success" ? (
                <p className="mt-5 text-sm font-medium">
                  Listo. Te avisamos primero.
                </p>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-5 flex items-center rounded-full border py-1.5 pl-5 pr-1.5"
                  style={{ borderColor: INK }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mail"
                    aria-label="Email"
                    className="min-w-0 flex-1 bg-transparent text-sm placeholder:opacity-60 focus:outline-none"
                    style={{ color: INK }}
                  />
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="shrink-0 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-[transform,opacity] duration-100 active:scale-[0.97] disabled:opacity-50"
                    style={{ backgroundColor: INK }}
                  >
                    {status === "sending" ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="mt-2 text-sm opacity-70" role="alert">
                  No se pudo enviar. Probá de nuevo.
                </p>
              )}

              <div className="mt-6 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    {...(s.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border transition-opacity hover:opacity-60"
                    style={{ borderColor: INK }}
                  >
                    <HugeiconsIcon icon={s.icon} size={16} strokeWidth={1.8} />
                  </a>
                ))}
              </div>

              {/* Quiz entry point (kept in the footer per request — the Figma
                  footer omits it, but this is the only QuizSheet trigger). */}
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <QuizSheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-11 shrink-0 items-center rounded-full px-6 text-sm font-medium text-white transition-[transform,opacity] duration-100 hover:opacity-90 active:scale-[0.97]"
                    style={{ backgroundColor: INK }}
                  >
                    Descubrí tu perfil MicroCore
                  </button>
                </QuizSheetTrigger>
                <p className="text-sm opacity-70">2 min &middot; personalizado</p>
              </div>
            </SectionReveal>

            {/* Nav columns */}
            <SectionReveal delay={0.06} className="flex gap-12 sm:gap-16 lg:gap-20">
              <nav className="flex flex-col gap-3.5">
                {siteNav.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-sm tracking-wide transition-opacity hover:opacity-60"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <nav className="flex flex-col gap-3.5">
                {legalNav.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-sm tracking-wide transition-opacity hover:opacity-60"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </SectionReveal>
          </div>
        </div>

        {/* Full-bleed wordmark */}
        <div className="mt-14 px-4 pb-6 lg:mt-20">
          <p
            className="select-none whitespace-nowrap text-center font-bold leading-none tracking-tight"
            style={{ color: INK, fontSize: "clamp(2.25rem, 12.8vw, 15rem)" }}
          >
            elemental bloom
          </p>
        </div>
      </div>
    </footer>
  );
}
