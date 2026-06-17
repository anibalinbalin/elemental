"use client";

import type { ComponentType } from "react";
import { CerebroShader } from "./cerebro-shader";
import { DeporteShader } from "./deporte-shader";
import { IntestinoShader } from "./intestino-shader";
import { SectionReveal } from "./section-reveal";

// EB-web-02 Figma: floating cream block (#f0f1e5, rounded top + bottom like the
// "Ingrediente funcional" section) on a near-white surround, with a regular-
// weight heading and three bare cards (rounded image, underlined title, "Ver
// más" beneath — no card box/shadow).
const BG = "#f9f9f9";
const BLOCK = "#f0f1e5";
const INK = "#1a1a1a";

// Per-category Paper shaders that fill a card's image slot.
const CARD_SHADERS: Record<string, ComponentType<{ className?: string }>> = {
  Cerebro: CerebroShader,
  Deporte: DeporteShader,
  Intestino: IntestinoShader,
};

// Curated from the real blog (content/blog → /blog/<slug>). Slugs match
// lib/blog.ts (filename minus the "NN-" order prefix and ".md").
const articles = [
  {
    title: "Tu intestino decide más de lo que pensás",
    category: "Cerebro",
    slug: "tu-intestino-decide-mas-de-lo-que-pensas",
  },
  {
    title: "Tomás proteína, pero ¿cuánto absorbés realmente?",
    category: "Deporte",
    slug: "tomas-proteina-pero-cuanto-absorbes-realmente",
  },
  {
    title: "Por qué te hinchás después de comer",
    category: "Intestino",
    slug: "por-que-te-hinchas-despues-de-comer-y",
  },
];

export function ScienceBlog() {
  return (
    <section id="ciencia-cotidiana" style={{ backgroundColor: BG }}>
      <div
        className="overflow-hidden rounded-[2.75rem] lg:rounded-[3.5rem]"
        style={{ backgroundColor: BLOCK }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
          <SectionReveal>
            <h2
              className="text-4xl font-normal tracking-tight lg:text-5xl"
              style={{ color: INK }}
            >
              Ciencia cotidiana
            </h2>
          </SectionReveal>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {articles.map((article, i) => {
              const Shader = CARD_SHADERS[article.category];
              return (
                <SectionReveal key={article.slug} delay={i * 0.08}>
                  <a href={`/blog/${article.slug}`} className="group block">
                    <div className="overflow-hidden rounded-3xl">
                      {Shader ? <Shader className="w-full" /> : null}
                    </div>
                    <h3
                      className="mt-5 text-xl font-medium underline decoration-1 underline-offset-[5px]"
                      style={{ color: INK }}
                    >
                      {article.title}
                    </h3>
                    <span
                      className="mt-1.5 inline-block text-sm transition-opacity group-hover:opacity-70"
                      style={{ color: INK }}
                    >
                      Ver más
                    </span>
                  </a>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
