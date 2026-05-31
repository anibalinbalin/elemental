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
            <MicrobiotaShader className={cn("w-full", shape.container)} />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
