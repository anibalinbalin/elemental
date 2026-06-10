"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PlaceholderImage } from "./placeholder-image";
import { SectionReveal } from "./section-reveal";

const posts = [
  { src: "/images/lifestyle-orange-water.webp", alt: "Mujer disfrutando un vaso de agua con naranja" },
  { src: "/images/pancakes.webp", alt: "Panqueques con banana y miel" },
  { src: "/images/recipe-orange-bread.webp", alt: "Budín de naranja y avena con polifenoles" },
  { src: "/images/shaker.webp", alt: "Preparando un shake con una medida de MICROCORE" },
  { src: "/images/bloom-yellow.webp", alt: "Detalle floral abstracto de Elemental Bloom" },
  { src: "/images/bloom-purple.webp", alt: "Detalle floral abstracto de Elemental Bloom" },
];

export function Community() {
  const shape = useShape();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="comunidad" className="bg-surface-2">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <SectionReveal>
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
              Sé parte de nuestra comunidad
            </h2>
            <p className="text-sm text-muted-foreground">@elementalbloomco</p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
            {posts.map((post, i) => (
              <PlaceholderImage
                key={i}
                className={cn("shrink-0 w-48 h-48", shape.item)}
                aspectRatio="1/1"
                src={post.src}
                alt={post.alt}
              />
            ))}
          </div>
        </SectionReveal>

        <SectionReveal delay={0.16}>
          <div className="mt-12 flex flex-col gap-4 max-w-md">
            <p className="text-sm text-muted-foreground">
              Lo que se viene, primero acá
            </p>
            {status === "success" ? (
              <p className="text-sm font-medium">Listo. Te avisamos primero.</p>
            ) : (
              <form className="flex gap-3" onSubmit={handleSubmit}>
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm",
                    "bg-surface-3 border border-border",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-foreground",
                    shape.input
                  )}
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={cn(
                    "px-6 py-3 text-sm font-medium",
                    "bg-foreground text-background",
                    "hover:opacity-90 transition-opacity",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    shape.button
                  )}
                >
                  {status === "sending" ? "Enviando..." : "Enviar"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="text-sm text-muted-foreground" role="alert">
                No se pudo enviar. Probá de nuevo.
              </p>
            )}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
