"use client";

import { SectionReveal } from "./section-reveal";
import { PlaceholderImage } from "./placeholder-image";

function IconDigestion({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6c-4 0-7 3-7 6.5S14 19 18 19h12c4 0 7 3 7 6.5S34 32 30 32H18c-4 0-7 3-7 6.5S14 45 18 45" />
      <path d="M30 6c4 0 7 3 7 6.5S34 19 30 19" />
      <path d="M18 32c-4 0-7-3-7-6.5" />
    </svg>
  );
}

function IconMood({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size * 1.4}
      height={size}
      viewBox="0 0 67 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 30 C8 30, 12 30, 18 10 C24 -10, 28 30, 34 30 C40 30, 42 20, 48 16 C54 12, 58 30, 65 30" />
    </svg>
  );
}

function IconInflammation({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
    >
      <line x1="24" y1="4" x2="24" y2="14" />
      <line x1="24" y1="34" x2="24" y2="44" />
      <line x1="4" y1="24" x2="14" y2="24" />
      <line x1="34" y1="24" x2="44" y2="24" />
      <line x1="9.9" y1="9.9" x2="16.9" y2="16.9" />
      <line x1="31.1" y1="31.1" x2="38.1" y2="38.1" />
      <line x1="38.1" y1="9.9" x2="31.1" y2="16.9" />
      <line x1="16.9" y1="31.1" x2="9.9" y2="38.1" />
    </svg>
  );
}

function IconEnergy({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M27 4 L14 26 H24 L21 44 L38 20 H26 Z" />
    </svg>
  );
}

function IconSkin({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      stroke="currentColor"
    >
      <line
        x1="6"
        y1="38"
        x2="42"
        y2="38"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle cx="12" cy="30" r="2" stroke="none" />
      <circle cx="24" cy="30" r="2" stroke="none" />
      <circle cx="36" cy="30" r="2" stroke="none" />
      <circle cx="8" cy="22" r="2" stroke="none" />
      <circle cx="18" cy="22" r="2" stroke="none" />
      <circle cx="30" cy="22" r="2" stroke="none" />
      <circle cx="40" cy="22" r="2" stroke="none" />
      <circle cx="14" cy="14" r="2" stroke="none" />
      <circle cx="24" cy="14" r="2" stroke="none" />
      <circle cx="34" cy="14" r="2" stroke="none" />
    </svg>
  );
}

const features = [
  { label: "Digestion", icon: IconDigestion },
  { label: "Estado\nde animo", icon: IconMood },
  { label: "Inflamacion", icon: IconInflammation },
  { label: "Energia", icon: IconEnergy },
  { label: "Piel", icon: IconSkin },
];

export function Microbiota() {
  return (
    <section id="microbiota" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <SectionReveal>
            <div className="flex flex-col gap-8">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Todo empieza en la
                <br />
                microbiota
              </h2>

              <p className="text-muted-foreground leading-relaxed max-w-lg">
                La microbiota intestinal participa en procesos clave del cuerpo:
              </p>

              <div className="flex flex-wrap gap-8 lg:gap-10">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.label}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="h-12 flex items-center justify-center">
                        <Icon size={48} />
                      </div>
                      <span className="text-[11px] font-medium text-foreground uppercase tracking-widest text-center whitespace-pre-line leading-tight">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-muted-foreground leading-relaxed max-w-lg">
                Cuando ese equilibrio se altera, el cuerpo lo siente.
                <br />
                <span className="font-bold text-foreground">MICROCORE</span> fue
                disenado para apoyar ese equilibrio.
              </p>

              <div>
                <a
                  href="#producto"
                  className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80"
                >
                  Ver formula
                </a>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <PlaceholderImage
              className="w-[420px] h-[420px] lg:w-[480px] lg:h-[480px] rounded-full"
              aspectRatio="1/1"
              label="Microbiota"
            />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
