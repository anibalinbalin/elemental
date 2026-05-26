"use client";

import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PlaceholderImage } from "./placeholder-image";
import { SectionReveal } from "./section-reveal";

const articles = [
  { title: "La Microbiota", slug: "microbiota" },
  { title: "Las proteinas tu batido", slug: "proteinas" },
  { title: "Las rutinas", slug: "rutinas" },
];

export function ScienceBlog() {
  const shape = useShape();

  return (
    <section id="ciencia-cotidiana" className="bg-surface-1">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <SectionReveal>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-12">
            Ciencia cotidiana
          </h2>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <SectionReveal key={article.slug} delay={i * 0.08}>
              <a
                href="#"
                className={cn(
                  "group block",
                  "bg-surface-3 shadow-surface-3",
                  "overflow-hidden",
                  "hover:shadow-surface-5 transition-shadow",
                  shape.container
                )}
              >
                <PlaceholderImage
                  className="w-full"
                  aspectRatio="16/10"
                  label={article.title}
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{article.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                    Ver mas
                  </span>
                </div>
              </a>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
