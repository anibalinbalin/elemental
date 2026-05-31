"use client";

import { SectionReveal } from "./section-reveal";
import { PlaceholderImage } from "./placeholder-image";

const BURGUNDY = "#5a2d42";
const LIME = "#c5e847";

function IconProbiotico() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke={BURGUNDY} strokeWidth={1.8} strokeLinecap="round">
      <circle cx="18" cy="18" r="14" />
      <circle cx="12" cy="13" r="2.2" fill={BURGUNDY} stroke="none" />
      <circle cx="20" cy="10" r="1.6" fill={BURGUNDY} stroke="none" />
      <circle cx="24" cy="16" r="2" fill={BURGUNDY} stroke="none" />
      <circle cx="14" cy="21" r="1.4" fill={BURGUNDY} stroke="none" />
      <circle cx="21" cy="24" r="2.4" fill={BURGUNDY} stroke="none" />
      <circle cx="10" cy="17" r="1.2" fill={BURGUNDY} stroke="none" />
      <circle cx="18" cy="16" r="1.8" fill={BURGUNDY} stroke="none" />
    </svg>
  );
}

function IconPrebiotico() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke={BURGUNDY} strokeWidth={2} strokeLinecap="round">
      <line x1="18" y1="4" x2="18" y2="32" />
      <line x1="4" y1="18" x2="32" y2="18" />
      <line x1="8" y1="8" x2="28" y2="28" />
      <line x1="28" y1="8" x2="8" y2="28" />
    </svg>
  );
}

function IconColageno() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke={BURGUNDY} strokeWidth={2} strokeLinecap="round">
      <path d="M4 11 C10 8, 14 14, 18 11 C22 8, 26 14, 32 11" />
      <path d="M4 18 C10 15, 14 21, 18 18 C22 15, 26 21, 32 18" />
      <path d="M4 25 C10 22, 14 28, 18 25 C22 22, 26 28, 32 25" />
    </svg>
  );
}

function IconAcai() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke={BURGUNDY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="22" r="6" />
      <circle cx="24" cy="20" r="5" />
      <path d="M18 16 C18 10, 22 6, 26 4" />
      <path d="M22 14 C24 10, 28 8, 30 8" />
    </svg>
  );
}

function IconHongo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke={BURGUNDY} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20 C6 12, 11 6, 18 6 C25 6, 30 12, 30 20 Z" />
      <line x1="18" y1="20" x2="18" y2="32" />
      <line x1="14" y1="32" x2="22" y2="32" />
    </svg>
  );
}

function IconZinc() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fontFamily="inherit"
        fontSize="18"
        fontWeight="600"
        fill={BURGUNDY}
      >
        Zn
      </text>
    </svg>
  );
}

const ingredients = [
  { label: "Probiotico\nesporulado", icon: IconProbiotico },
  { label: "Prebiotico", icon: IconPrebiotico },
  { label: "Colageno", icon: IconColageno },
  { label: "Acai", icon: IconAcai },
  { label: "Hongo\nfuncional", icon: IconHongo },
  { label: "Zinc", icon: IconZinc },
];

export function MicrocoreCard() {
  return (
    <section
      id="producto"
      style={{ backgroundColor: BURGUNDY }}
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-12 items-center">
            {/* Left: text content */}
            <div className="flex flex-col gap-6">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                MICROCORE
              </h2>

              <p className="text-lg lg:text-xl font-bold text-white leading-snug">
                Una sola cucharada. Cinco funciones.
                <br />
                Sin capsulas.
              </p>

              <p className="text-white/80 leading-relaxed">
                Frio o caliente, llega activo igual.
                <br />
                Estudios clinicos demostraron que esta cepa (
                <em>Bacillus Coagulans</em>) favorece la absorcion de
                aminoacidos. Mas proteina aprovechada, misma porcion.
              </p>

              <div className="pt-2">
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-3 text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Conocer <span className="font-bold ml-1">MICROCORE</span>
                </a>
              </div>
            </div>

            {/* Center: product image */}
            <div className="flex items-end justify-center">
              <PlaceholderImage
                className="w-[280px] lg:w-[320px] rounded-2xl"
                aspectRatio="3/4"
                label="MICROCORE"
              />
            </div>

            {/* Right: badges + ingredient circles */}
            <div className="flex flex-col gap-8">
              {/* Top badges row */}
              <div className="flex items-center gap-4">
                {/* Star circle + "5 en 1" pill, overlapping */}
                <div className="flex items-center">
                  <span
                    className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full"
                    style={{ backgroundColor: BURGUNDY, boxShadow: `0 0 0 1.5px #e8ddd0` }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#e8ddd0" strokeWidth="2" strokeLinecap="round">
                      <line x1="10" y1="1" x2="10" y2="19" />
                      <line x1="1" y1="10" x2="19" y2="10" />
                      <line x1="3.5" y1="3.5" x2="16.5" y2="16.5" />
                      <line x1="16.5" y1="3.5" x2="3.5" y2="16.5" />
                    </svg>
                  </span>
                  <span
                    className="-ml-4 inline-flex items-center justify-center rounded-full pl-7 pr-5 py-2.5 text-sm font-medium tracking-wide"
                    style={{ color: "#e8ddd0", boxShadow: `0 0 0 1.5px #e8ddd0` }}
                  >
                    5 en 1
                  </span>
                </div>
                <span
                  className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold tracking-wider"
                  style={{ color: "#e8ddd0", boxShadow: `0 0 0 1.5px #e8ddd0` }}
                >
                  MICROCORE
                </span>
              </div>

              {/* Ingredient circles grid */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                {ingredients.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: LIME }}
                      >
                        <Icon />
                      </div>
                      <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider text-center whitespace-pre-line leading-tight">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
