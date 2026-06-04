"use client";

import { SectionReveal } from "./section-reveal";
import { PlaceholderImage } from "./placeholder-image";

const BURGUNDY = "#5a2d42";
const LIME = "#C8F670";
const CREAM = "#F0F1E5";

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
              {/* Paper-designed badge: circle + 5 en 1 pill + MICROCORE pill */}
              <div className="relative" style={{ height: 50, width: 396 }}>
                {/* Star circle */}
                <svg viewBox="0 0 50.08 50" xmlns="http://www.w3.org/2000/svg" style={{ width: 50, height: 50, position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                  <path d="M42.770 7.370C47.510 12.090 50.100 18.350 50.080 25.000C50.050 31.670 47.410 37.970 42.650 42.710C37.870 47.410 31.580 50.000 24.920 50.000C11.150 49.960 -0.020 38.710 0.000 24.900C0.040 11.170 11.270 0.000 25.020 0.000C31.720 0.010 38.030 2.630 42.760 7.380C42.760 7.380 42.770 7.370 42.770 7.370Z" fill="none" stroke={CREAM} strokeWidth="1.36" vectorEffect="non-scaling-stroke" strokeMiterlimit="10" />
                </svg>
                {/* Star glyph inside circle */}
                <svg viewBox="0 0 19.37 16.72" xmlns="http://www.w3.org/2000/svg" style={{ width: 19, height: 17, position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", overflow: "visible" }}>
                  <path d="M1.900 3.100C1.900 3.100 8.820 8.360 8.820 8.360C8.820 8.360 8.930 8.360 8.930 8.360C8.930 8.360 7.820 0.000 7.820 0.000C7.820 0.000 11.580 0.000 11.580 0.000C11.580 0.000 10.580 8.360 10.580 8.360C10.580 8.360 10.690 8.360 10.690 8.360C10.690 8.360 17.330 3.050 17.330 3.050C17.330 3.050 19.320 6.540 19.320 6.540C19.320 6.540 11.570 9.860 11.570 9.860C11.570 9.860 11.570 9.970 11.570 9.970C11.570 9.970 19.370 13.570 19.370 13.570C19.370 13.570 17.380 16.720 17.380 16.720C17.380 16.720 10.630 11.460 10.630 11.460C10.630 11.460 10.520 11.460 10.520 11.460C10.520 11.460 8.860 11.520 8.860 11.520C8.860 11.520 8.750 11.520 8.750 11.520C8.750 11.520 2.000 16.720 2.000 16.720C2.000 16.720 0.060 13.340 0.060 13.340C0.060 13.340 7.750 9.910 7.750 9.910C7.750 9.910 7.750 9.800 7.750 9.800C7.750 9.800 0.000 6.420 0.000 6.420C0.000 6.420 1.880 3.100 1.880 3.100C1.880 3.100 1.900 3.100 1.900 3.100Z" fill={CREAM} fillRule="evenodd" />
                </svg>
                {/* "5 en 1" pill */}
                <svg viewBox="0 0 131.11 48.25" xmlns="http://www.w3.org/2000/svg" style={{ width: 131, height: 48, position: "absolute", left: 40, top: 1, overflow: "visible" }}>
                  <path d="M24.120 0.000C24.120 0.000 106.990 0.000 106.990 0.000C120.311 0.000 131.110 10.799 131.110 24.120C131.110 24.120 131.110 24.130 131.110 24.130C131.110 37.451 120.311 48.250 106.990 48.250C106.990 48.250 24.120 48.250 24.120 48.250C10.799 48.250 0.000 37.451 0.000 24.130C0.000 24.130 0.000 24.120 0.000 24.120C0.000 10.799 10.799 0.000 24.120 0.000Z" fill="none" stroke={CREAM} strokeWidth="1.36" vectorEffect="non-scaling-stroke" strokeMiterlimit="10" />
                </svg>
                <span style={{ position: "absolute", left: 64, top: "50%", transform: "translateY(-50%)", color: CREAM, fontSize: 24, lineHeight: 1, fontFamily: "inherit" }}>
                  5 en 1
                </span>
                {/* "MICRO CORE" pill */}
                <svg viewBox="0 0 207.26 48.25" xmlns="http://www.w3.org/2000/svg" style={{ width: 207, height: 48, position: "absolute", left: 189, top: 1, overflow: "visible" }}>
                  <path d="M24.120 0.000C24.120 0.000 183.140 0.000 183.140 0.000C196.461 0.000 207.260 10.799 207.260 24.120C207.260 24.120 207.260 24.130 207.260 24.130C207.260 37.451 196.461 48.250 183.140 48.250C183.140 48.250 24.120 48.250 24.120 48.250C10.799 48.250 0.000 37.451 0.000 24.130C0.000 24.130 0.000 24.120 0.000 24.120C0.000 10.799 10.799 0.000 24.120 0.000Z" fill="none" stroke={CREAM} strokeWidth="1.36" vectorEffect="non-scaling-stroke" strokeMiterlimit="10" />
                </svg>
                <span style={{ position: "absolute", left: 218, top: "50%", transform: "translateY(-50%)", color: CREAM, fontSize: 24, lineHeight: 1, fontWeight: 700, fontFamily: "inherit" }}>
                  MICRO CORE
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
