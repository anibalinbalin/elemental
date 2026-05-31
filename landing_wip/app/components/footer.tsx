"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Facebook01Icon from "@hugeicons/core-free-icons/Facebook01Icon";
import InstagramIcon from "@hugeicons/core-free-icons/InstagramIcon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import { SectionReveal } from "./section-reveal";
import { QuizSheetTrigger } from "./quiz-sheet";

const colLeft = [
  { label: "Microbiota", href: "#microbiota" },
  { label: "Producto", href: "#producto" },
  { label: "Ciencia", href: "#ciencia" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Origen", href: "#origen" },
  { label: "Comunidad", href: "#comunidad" },
];

const colRight = [
  { label: "Términos", href: "#" },
  { label: "Garantía", href: "#" },
  { label: "Envíos", href: "#" },
  { label: "FAQ", href: "#" },
];

const socialIcons = [
  { icon: Facebook01Icon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: Mail01Icon, label: "Email" },
];

export function Footer() {
  return (
    <footer>
      <div className="bg-surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-6 pt-20 lg:pt-28 pb-12">
          <SectionReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="flex flex-col gap-3">
                {colLeft.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {colRight.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.06}>
            <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-center">
              <QuizSheetTrigger asChild>
                <button
                  type="button"
                  className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-surface-3 transition-[transform,opacity] duration-100 hover:opacity-90 active:scale-[0.97]"
                >
                  Descubrí tu perfil MicroCore
                </button>
              </QuizSheetTrigger>
              <p className="text-sm text-muted-foreground">
                2 min &middot; personalizado &middot; con menú de 7 días
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <div className="flex gap-4 mb-16">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <HugeiconsIcon
                    icon={social.icon}
                    size={16}
                    strokeWidth={1.5}
                    className="text-muted-foreground"
                  />
                </a>
              ))}
            </div>
          </SectionReveal>

          <div className="overflow-hidden">
            <p className="text-6xl lg:text-[10rem] font-bold tracking-tighter leading-none text-foreground/[0.06] select-none whitespace-nowrap">
              Elemental Bloom
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
