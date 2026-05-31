"use client";

import DigestionIcon from "@hugeicons/core-free-icons/DigestionIcon";
import HappyIcon from "@hugeicons/core-free-icons/HappyIcon";
import Shield01Icon from "@hugeicons/core-free-icons/Shield01Icon";
import FlashIcon from "@hugeicons/core-free-icons/FlashIcon";
import Leaf01Icon from "@hugeicons/core-free-icons/Leaf01Icon";
import { VisuallyHidden } from "@silk-hq/components";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { MicrobiotaShader } from "./microbiota-shader";
import { SectionReveal } from "./section-reveal";
import { FeatureIcon } from "./feature-icon";
import { LongSheet } from "./silk-long-sheet";

const features = [
  { label: "Digestion", icon: DigestionIcon },
  { label: "Estado de animo", icon: HappyIcon },
  { label: "Inflamacion", icon: Shield01Icon },
  { label: "Energia", icon: FlashIcon },
  { label: "Piel", icon: Leaf01Icon },
];

const formulaComponents = [
  { component: "[VSA111] Gluconato de zinc - Bio Zn AAS - 10 kg", percentage: "< 0.5%" },
  { component: "[VA004] Ganeden BC30 - 1 kg", percentage: "< 0.5%" },
  { component: "[VAC009] Ácido cítrico anhidro - 25 kg", percentage: "1%" },
  { component: "[NUT030] Beneo Orafti oligofructosa P95 - 25 kg", percentage: "5%" },
  { component: "[SSP007] Extracto de maca 5:1 - 20 kg (Peruvian)", percentage: "5%" },
  { component: "ZM Extracto seco de melena de león 3:1 (polvo)", percentage: "5%" },
  { component: "[NUT017] Beneo Orafti inulina GR - 25 kg", percentage: "10%" },
  { component: "[VA023] Maltodextrina - 25 kg", percentage: "24%" },
  { component: "[VA252] Gelatina Solugel Prima BD - 15 kg", percentage: "25%" },
  { component: "ZM Açaí en polvo Nutana", percentage: "25%" },
];

const nutritionFacts = [
  { nutrient: "Valor energético", amount: "50 kcal = 211 kJ", dailyValue: "3%" },
  { nutrient: "Carbohidratos", amount: "6.3 g", dailyValue: "2%" },
  { nutrient: "De los cuales azúcares", amount: "0.24 g", dailyValue: "-" },
  { nutrient: "Proteínas", amount: "4.6 g", dailyValue: "6%" },
  { nutrient: "Grasas totales", amount: "0.0 g", dailyValue: "0%" },
  { nutrient: "Grasas saturadas", amount: "0.0 g", dailyValue: "0%" },
  { nutrient: "Grasas trans", amount: "0.0 g", dailyValue: "-" },
  { nutrient: "Fibra alimentaria", amount: "2.7 g", dailyValue: "11%" },
  { nutrient: "Sodio", amount: "15 mg", dailyValue: "1%" },
];

/**
 * Splits a leading "[CODE]" tag off an ingredient name and renders it as a
 * pill (e.g. "[VSA111] Gluconato…" → a mono pill + the rest of the label).
 * Names without a bracketed code render unchanged.
 */
function renderComponent(component: string) {
  const match = component.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (!match) return component;
  const [, code, label] = match;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-medium tracking-tight text-gray-500">
        {code}
      </span>
      <span>{label}</span>
    </span>
  );
}

export function Microbiota() {
  const shape = useShape();

  return (
    <section id="microbiota" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <SectionReveal>
            <div className="flex flex-col gap-8">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                Todo empieza en la
                <br />
                microbiota
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                La microbiota intestinal participa en procesos clave del cuerpo.
                Cuando ese equilibrio se altera, el cuerpo lo siente. MICROCORE
                fue disenado para apoyar ese equilibrio.
              </p>

              <div className="flex flex-wrap gap-6">
                {features.map((feature) => (
                  <FeatureIcon
                    key={feature.label}
                    label={feature.label}
                    icon={feature.icon}
                  />
                ))}
              </div>

              <div>
                <LongSheet.Root>
                  <LongSheet.Trigger asChild>
                    <button
                      type="button"
                      className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors cursor-pointer"
                    >
                      Ver formula
                    </button>
                  </LongSheet.Trigger>
                  <LongSheet.Portal>
                    <LongSheet.View>
                      <LongSheet.Backdrop />
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
                              <h1>Formula MICROCORE</h1>
                            </LongSheet.Title>
                            <h2 className="ExampleLongSheet-subtitle">
                              Una sola cucharada. Cinco funciones.
                            </h2>
                            <section className="ExampleLongSheet-articleBody">
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Suplemento pro/prebiótico con açaí
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Polvo para preparar bebida con prebióticos y
                                  probióticos con açaí en polvo.
                                </p>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Ingredientes: açaí en polvo, gelatina bovina
                                  hidrolizada (colágeno), maltodextrina, inulina,
                                  oligofructosa, extracto de maca, extracto de
                                  melena de león, probiótico Bacillus coagulans
                                  GBI-30 6086, gluconato de zinc y acidulante
                                  ácido cítrico (INS 330).
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Composición de la fórmula
                                </h3>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-[0.08em] text-gray-500">
                                      <tr>
                                        <th className="px-4 py-3 font-semibold">
                                          Componente
                                        </th>
                                        <th className="w-28 px-4 py-3 text-right font-semibold">
                                          Fórmula
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {formulaComponents.map((item) => (
                                        <tr key={item.component}>
                                          <td className="px-4 py-3 text-gray-800">
                                            {renderComponent(item.component)}
                                          </td>
                                          <td className="px-4 py-3 text-right font-medium text-gray-950">
                                            {item.percentage}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Información nutricional
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph text-base text-gray-600">
                                  Porción: 20 g en 200 mL de agua (1 vaso).
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-[0.08em] text-gray-500">
                                      <tr>
                                        <th className="px-4 py-3 font-semibold">
                                          Nutriente
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold">
                                          Cantidad por porción
                                        </th>
                                        <th className="w-24 px-4 py-3 text-right font-semibold">
                                          % VD
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {nutritionFacts.map((item) => (
                                        <tr key={item.nutrient}>
                                          <td className="px-4 py-3 text-gray-800">
                                            {item.nutrient}
                                          </td>
                                          <td className="px-4 py-3 text-right text-gray-800">
                                            {item.amount}
                                          </td>
                                          <td className="px-4 py-3 text-right font-medium text-gray-950">
                                            {item.dailyValue}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <p className="ExampleLongSheet-articleParagraph text-sm text-gray-500">
                                  % Valores diarios con base a una dieta de
                                  2.000 kcal u 8.400 kJ. Sus valores diarios
                                  pueden ser mayores o menores dependiendo de sus
                                  necesidades energéticas.
                                </p>
                              </div>

                              <div className="grid gap-3 rounded-lg bg-gray-50 p-4 text-base text-gray-700">
                                <p className="ExampleLongSheet-articleParagraph">
                                  Aporta mínimo 1x10⁹ ufc por porción de producto
                                  de B. coagulans GBI-30 6086.
                                </p>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Aporta 1.75 mg de zinc por porción (25% de la
                                  IDR).
                                </p>
                              </div>

                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Modo de uso
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Disolver 20 gramos del polvo en 200 mL de agua.
                                  Se sugiere consumir una dosis diaria.
                                </p>
                                <p className="ExampleLongSheet-articleParagraph">
                                  Almacenar en el envase original, en lugar fresco
                                  y seco al resguardo de la luz.
                                </p>
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
            <MicrobiotaShader className={cn("w-full", shape.container)} />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
