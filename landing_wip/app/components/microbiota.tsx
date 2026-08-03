"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import DigestionIcon from "@hugeicons/core-free-icons/DigestionIcon";
import FlashIcon from "@hugeicons/core-free-icons/FlashIcon";
import { VisuallyHidden } from "@silk-hq/components";
import { MicrobiotaShader } from "./microbiota-shader";
import { SectionReveal } from "./section-reveal";
import { LongSheet } from "./silk-long-sheet";

/* Bare thin-line icons matching the EB-web-02 Figma function row. Intestine and
 * bolt come from Hugeicons; the wave, burst and skin-dots are drawn inline since
 * the Figma uses custom glyphs Hugeicons doesn't carry. All render in currentColor. */
function IconWave() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M2 24q5.5-9 11 0t11 0 11 0 11 0" />
    </svg>
  );
}

function IconBurst() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-full w-full">
      <path d="M31 24h8M28.95 19.05l5.65-5.65M24 17V9M19.05 19.05l-5.65-5.65M17 24H9M19.05 28.95l-5.65 5.65M24 31v8M28.95 28.95l5.65 5.65" />
    </svg>
  );
}

function IconDots() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-full w-full">
      <path d="M7 24h34" />
      <g fill="currentColor" stroke="none">
        <circle cx="13" cy="15" r="1.3" />
        <circle cx="22" cy="13" r="1.3" />
        <circle cx="31" cy="15" r="1.3" />
        <circle cx="38" cy="13" r="1.3" />
        <circle cx="16" cy="33" r="1.3" />
        <circle cx="25" cy="35" r="1.3" />
        <circle cx="34" cy="33" r="1.3" />
      </g>
    </svg>
  );
}

const functions = [
  { label: "Digestión", render: () => <HugeiconsIcon icon={DigestionIcon} size={40} strokeWidth={1.7} /> },
  { label: "Estado de ánimo", render: () => <IconWave /> },
  { label: "Inflamación", render: () => <IconBurst /> },
  { label: "Energía", render: () => <HugeiconsIcon icon={FlashIcon} size={40} strokeWidth={1.7} /> },
  { label: "Piel", render: () => <IconDots /> },
];

const nutritionFacts = [
  { nutrient: "Valor energético", amount: "50 kcal", dailyValue: "3" },
  { nutrient: "Carbohidratos", amount: "6,3 g", dailyValue: "2" },
  { nutrient: "Azúcares", amount: "0,24 g", dailyValue: "-" },
  { nutrient: "Proteínas", amount: "4,6 g", dailyValue: "6" },
  { nutrient: "Grasas totales", amount: "0,0 g", dailyValue: "0" },
  { nutrient: "Fibra alimentaria", amount: "2,7 g", dailyValue: "11" },
  { nutrient: "Sodio", amount: "15 mg", dailyValue: "1" },
];

export function Microbiota() {
  const [formulaOpen, setFormulaOpen] = useState(false);

  return (
    <section id="microbiota" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionReveal>
            <div className="flex flex-col gap-7">
              <h2 className="text-[2.75rem] font-bold leading-[1.0] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Todo empieza en la
                <br />
                microbiota
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-foreground">
                La microbiota intestinal participa en procesos clave del cuerpo:
              </p>

              <div className="flex flex-wrap gap-x-7 gap-y-6">
                {functions.map((f) => (
                  <div
                    key={f.label}
                    className="flex w-[68px] flex-col items-center gap-3 text-center"
                  >
                    <span className="flex h-11 w-11 items-center justify-center text-[#171717]">
                      {f.render()}
                    </span>
                    <span className="text-[11px] font-medium uppercase leading-tight tracking-[0.08em] text-foreground/70">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="max-w-md leading-relaxed text-foreground/80">
                Cuando ese equilibrio se altera, el cuerpo lo siente.{" "}
                <strong className="font-semibold text-foreground">MICROCORE</strong>{" "}
                fue diseñado para apoyar ese equilibrio.
              </p>

              <div>
                <LongSheet.Root
                  presented={formulaOpen}
                  onPresentedChange={setFormulaOpen}
                >
                  <LongSheet.Trigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-12 items-center rounded-full bg-[#171717] px-7 text-[15px] font-medium text-white transition-[transform,background-color] duration-150 hover:bg-[#262626] active:scale-[0.98]"
                    >
                      Ver fórmula
                    </button>
                  </LongSheet.Trigger>
                  <LongSheet.Portal>
                    <LongSheet.View>
                      <LongSheet.Backdrop onClick={() => setFormulaOpen(false)} />
                      <LongSheet.Content>
                        <article className="ExampleLongSheet-article">
                          <LongSheet.Trigger action="dismiss" asChild>
                            <button className="ExampleLongSheet-dismissTrigger">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ExampleLongSheet-dismissIcon"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                              <VisuallyHidden.Root>Cerrar</VisuallyHidden.Root>
                            </button>
                          </LongSheet.Trigger>
                          <div className="ExampleLongSheet-articleContent">
                            <LongSheet.Title className="ExampleLongSheet-title" asChild>
                              <h1>Fórmula MICROCORE</h1>
                            </LongSheet.Title>
                            <h2 className="ExampleLongSheet-subtitle">
                              Tres cucharadas al dia. En lo que ya comes.
                            </h2>
                            <section className="ExampleLongSheet-articleBody">
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Ingredientes
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Açaí en polvo, gelatina bovina hidrolizada
                                  (colágeno), maltodextrina, inulina,
                                  oligofructosa, extracto de maca, extracto de
                                  melena de león, probiótico: Bacillus coagulans
                                  GBI-30 6086, gluconato de zinc, acidulante:
                                  ácido cítrico (INS 330).
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Información nutricional
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph text-base text-gray-600">
                                  Porción: 20 g en 200 mL de agua (1 vaso)
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                  <table className="w-full border-collapse text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-300">
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-950" />
                                        <th className="px-4 py-2.5 text-right font-semibold text-gray-950">
                                          Cantidad
                                        </th>
                                        <th className="w-16 px-4 py-2.5 text-right font-semibold text-gray-950">
                                          %VD
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {nutritionFacts.map((item) => (
                                        <tr key={item.nutrient}>
                                          <td className="px-4 py-2.5 text-gray-800">
                                            {item.nutrient}
                                          </td>
                                          <td className="px-4 py-2.5 text-right text-gray-800">
                                            {item.amount}
                                          </td>
                                          <td className="px-4 py-2.5 text-right text-gray-500">
                                            {item.dailyValue}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <p className="ExampleLongSheet-articleParagraph text-sm text-gray-500">
                                  *% Valores diarios con base a una dieta de
                                  2.000 kcal.
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Modo de uso
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  1 dosis diaria sugerida en 200 mL de agua.
                                  Disolver 20 gramos del polvo. Se sugiere
                                  consumir una dosis diaria.
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Almacenamiento
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Almacenar al resguardo de la luz, en lugar
                                  fresco y seco. Almacenar en el envase original.
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center">
                                  <p className="text-lg font-bold text-gray-950">
                                    1 x 10<sup>9</sup> UFC
                                  </p>
                                  <p className="mt-1 text-xs leading-snug text-gray-500">
                                    por porción de producto de
                                    B.&nbsp;coagulans GBI&#8209;30&nbsp;6086
                                  </p>
                                </div>
                                <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center">
                                  <p className="text-lg font-bold text-gray-950">
                                    1.76 Mg
                                  </p>
                                  <p className="mt-1 text-xs leading-snug text-gray-500">
                                    De Zinc aporta por porción
                                  </p>
                                </div>
                              </div>
                            </section>
                          </div>
                        </article>
                      </LongSheet.Content>
                    </LongSheet.View>
                  </LongSheet.Portal>
                </LongSheet.Root>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="mx-auto w-full max-w-[560px]">
              <MicrobiotaShader
                className="w-full rounded-full"
                aspect="1 / 1"
                loupeHidden={formulaOpen}
              />
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
