"use client";

import { VisuallyHidden } from "@silk-hq/components";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { CursorDrivenParticleImage } from "./cursor-driven-particle-crest";
import { SectionReveal } from "./section-reveal";
import { LongSheet } from "./silk-long-sheet";

const usageSteps = [
  {
    number: "01",
    title: "Abri el sachet",
    body: "Cada sachet tiene la dosis diaria exacta. No necesitas medir nada.",
  },
  {
    number: "02",
    title: "Mezclalo con lo que quieras",
    body: "Agua, yogur, avena, smoothie, jugo, mate, café. Frío, tibio o caliente hasta 80 °C.",
  },
  {
    number: "03",
    title: "Listo. No hay paso tres.",
    body: "Sin cápsulas, sin horarios, sin refrigerar. Se adapta a tu rutina, no al revés.",
  },
];

const compatibilityItems = [
  { name: "Agua o jugo", temp: "Ambiente", status: "ideal" as const, bg: "/images/badge-agua.webp" },
  { name: "Yogur o avena", temp: "Frío", status: "ideal" as const, bg: "/images/badge-yogur.webp" },
  { name: "Café o té", temp: "Hasta 80 °C", status: "ideal" as const, bg: "/images/badge-cafe.webp" },
  { name: "Smoothie o licuado", temp: "Frío", status: "ideal" as const, bg: "/images/badge-smoothie.webp" },
  { name: "Panqueque o muffin", temp: "Cocción", status: "ok" as const, bg: "/images/badge-panqueque.webp" },
  { name: "Horneado intenso", temp: "> 100 °C", status: "ok" as const, bg: "/images/badge-horneado.webp" },
];

const scienceHighlights = [
  {
    value: "94,8%",
    label: "Supervivencia",
    detail: "tras infusión + tránsito gástrico simulado",
  },
  {
    value: "< 1 log",
    label: "Pérdida a 80 °C",
    detail: "prácticamente nula en uso indicado",
  },
  {
    value: "GRAS",
    label: "Estatus FDA",
    detail: "cepa documentada y aprobada (EE.UU.)",
  },
];

export function FunctionalIngredient() {
  const shape = useShape();

  return (
    <section id="como-funciona" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <SectionReveal>
            {/* Particle coat of arms — reinforces "desarrollado en Uruguay".
             * Tuned values baked in as constants (no DialKit in production). */}
            <div
              className={cn(
                "relative w-full overflow-hidden bg-surface-2",
                shape.container
              )}
              style={{ aspectRatio: "1/1" }}
            >
              <CursorDrivenParticleImage
                className="!min-h-0"
                src="/coat-of-arms-uruguay.svg"
                particleDensity={5}
                particleSize={1.5}
                scale={0.75}
                alphaThreshold={128}
                dispersionStrength={15}
                returnSpeed={0.08}
                friction={0.85}
                interactionRadius={75}
              />
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                Ingrediente funcional termorresistente desarrollado en Uruguay.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Los probióticos comunes mueren con el calor. Por eso la mayoría
                viene en cápsulas que no podés mezclar con nada caliente.
                MICROCORE está formulado con Bacillus Coagulans esporulado,
                sobrevive al calor, al frío y al ácido estomacal. Llega activo
                donde tiene que llegar.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Mezclalo en tu yogur, tu avena o tu smoothie. Frío o caliente,
                llega activo igual. No cambies tu rutina. Se adapta a ella.
              </p>
              <div className="pt-2">
                <LongSheet.Root>
                  <LongSheet.Trigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center justify-center",
                        "border border-foreground",
                        "px-8 py-3 text-sm font-medium",
                        "hover:bg-foreground hover:text-background transition-colors cursor-pointer",
                        shape.button
                      )}
                    >
                      Ver cómo usarlo
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
                              <h1>Cómo usar MICROCORE</h1>
                            </LongSheet.Title>
                            <h2 className="ExampleLongSheet-subtitle">
                              Un sachet por día. En lo que ya tomás. Sin cambiar
                              nada.
                            </h2>

                            <section className="ExampleLongSheet-articleBody">
                              {/* ── Steps ── */}
                              <div className="grid gap-6">
                                {usageSteps.map((step) => (
                                  <div key={step.number} className="flex gap-5">
                                    <span className="shrink-0 font-mono text-3xl font-bold text-gray-200 leading-none pt-0.5">
                                      {step.number}
                                    </span>
                                    <div className="grid gap-1">
                                      <h3 className="text-lg font-semibold text-gray-950 leading-snug">
                                        {step.title}
                                      </h3>
                                      <p className="ExampleLongSheet-articleParagraph text-base text-gray-600">
                                        {step.body}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* ── Compatibility grid ── */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  Funciona con todo
                                </h3>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                  {compatibilityItems.map((item) => (
                                    <div
                                      key={item.name}
                                      className="relative overflow-hidden rounded-xl px-4 py-3"
                                    >
                                      <img
                                        src={item.bg}
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover"
                                      />
                                      <div className="relative">
                                        <p className="text-sm font-medium text-white leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                                          {item.name}
                                        </p>
                                        <p className="mt-0.5 font-mono text-xs text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                                          {item.temp}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="ExampleLongSheet-articleParagraph text-sm text-gray-500">
                                  En cocción (panqueques, muffins) pierde algo de
                                  potencia pero sigue siendo funcional. Para
                                  máximo beneficio, usalo en bebidas o platos
                                  fríos/tibios.
                                </p>
                              </div>

                              {/* ── Science summary ── */}
                              <div className="grid gap-4">
                                <h3 className="text-lg font-semibold text-gray-950">
                                  La ciencia detrás
                                </h3>
                                <p className="ExampleLongSheet-articleParagraph text-base text-gray-600">
                                  MICROCORE usa Bacillus coagulans esporulado: una
                                  cepa que forma una coraza natural (espora) que
                                  resiste calor, acidez y procesamiento. No es como
                                  los probióticos comunes que mueren fuera de la
                                  heladera.
                                </p>
                                <div className="grid gap-2 sm:grid-cols-3">
                                  {scienceHighlights.map((item) => (
                                    <div
                                      key={item.label}
                                      className="rounded-xl border border-gray-200 px-4 py-3 text-center"
                                    >
                                      <p className="font-mono text-lg font-bold text-gray-950">
                                        {item.value}
                                      </p>
                                      <p className="mt-1 text-xs font-medium leading-snug text-gray-700">
                                        {item.label}
                                      </p>
                                      <p className="mt-0.5 text-xs leading-snug text-gray-500">
                                        {item.detail}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* ── Footer note ── */}
                              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="ExampleLongSheet-articleParagraph text-sm text-gray-500">
                                  Información basada en estudios de la cepa GBI-30,
                                  6086. No constituye consejo médico. Producto en
                                  proceso de registro.
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
        </div>
      </div>
    </section>
  );
}
