"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PlaceholderImage } from "./placeholder-image";
import { CerebroShader } from "./cerebro-shader";
import { DeporteShader } from "./deporte-shader";
import { IntestinoShader } from "./intestino-shader";
import { SectionReveal } from "./section-reveal";

const CARD_SHADERS: Record<string, ComponentType<{ className?: string }>> = {
  Cerebro: CerebroShader,
  Deporte: DeporteShader,
  Intestino: IntestinoShader,
};

const articles = [
  {
    title: "Tu intestino decide mas de lo que pensas",
    category: "Cerebro",
    slug: "tu-intestino-decide-mas-de-lo-que-pensas",
  },
  {
    title: "Tomas proteina, pero cuanto absorbes realmente?",
    category: "Deporte",
    slug: "tomas-proteina-pero-cuanto-absorbes-realmente",
  },
  {
    title: "Por que te hinchas despues de comer",
    category: "Intestino",
    slug: "por-que-te-hinchas-despues-de-comer-y",
  },
];

export function ScienceBlog() {
  const shape = useShape();

  return (
    <section id="ciencia-cotidiana" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <SectionReveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
              Ciencia cotidiana
            </h2>
            <a
              href="/blog"
              className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Ver todas las notas
            </a>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => {
            const Shader = CARD_SHADERS[article.category];
            return (
              <SectionReveal key={article.slug} delay={i * 0.08} className="h-full">
                <a
                  href={`/blog/${article.slug}`}
                  className={cn(
                    "group flex h-full flex-col",
                    "bg-surface-3 shadow-surface-3",
                    "overflow-hidden",
                    "hover:shadow-surface-5 transition-shadow",
                    shape.container
                  )}
                >
                  {Shader ? (
                    <Shader className="w-full" />
                  ) : (
                    <PlaceholderImage
                      className="w-full"
                      aspectRatio="16/10"
                      label={article.category}
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {article.category}
                    </span>
                    <h3 className="mt-2 text-lg font-bold leading-snug">
                      {article.title}
                    </h3>
                    <span className="mt-auto pt-4 inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                      Ver mas
                    </span>
                  </div>
                </a>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
