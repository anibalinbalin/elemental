"use client";

import MicroscopeIcon from "@hugeicons/core-free-icons/MicroscopeIcon";
import MoleculesIcon from "@hugeicons/core-free-icons/MoleculesIcon";
import Atom01Icon from "@hugeicons/core-free-icons/Atom01Icon";
import PillIcon from "@hugeicons/core-free-icons/PillIcon";
import LabsIcon from "@hugeicons/core-free-icons/LabsIcon";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PlaceholderImage } from "./placeholder-image";
import { SectionReveal } from "./section-reveal";
import { FeatureIcon } from "./feature-icon";

const features = [
  { label: "Probiotico", icon: MicroscopeIcon },
  { label: "Proteina", icon: MoleculesIcon },
  { label: "Aminoacidos", icon: Atom01Icon },
  { label: "Vitaminas", icon: PillIcon },
  { label: "Zinc", icon: LabsIcon },
];

export function MicrocoreCard() {
  const shape = useShape();

  return (
    <section id="producto" className="dark">
      <div className="bg-surface-1 text-foreground py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionReveal>
            <div
              className={cn(
                "bg-surface-3 shadow-surface-4",
                "p-8 lg:p-16",
                shape.container
              )}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Microcore
                  </span>
                  <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                    MICROCORE
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Una sola cucharada. Cinco funciones. Sin capsulas. Frio o
                    caliente, llega activo igual.
                  </p>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "bg-surface-5 px-3 py-1.5",
                        "text-xs font-mono",
                        shape.button
                      )}
                    >
                      5 en 1
                    </span>
                    <span className="text-xs text-muted-foreground font-mono uppercase">
                      Microcore
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4">
                    {features.map((feature) => (
                      <FeatureIcon
                        key={feature.label}
                        label={feature.label}
                        icon={feature.icon}
                      />
                    ))}
                  </div>

                  <div className="pt-4">
                    <a
                      href="#"
                      className={cn(
                        "inline-flex items-center justify-center",
                        "bg-foreground text-background",
                        "px-8 py-3 text-sm font-medium",
                        "hover:opacity-90 transition-opacity",
                        shape.button
                      )}
                    >
                      Conocer MICROCORE
                    </a>
                  </div>
                </div>

                <PlaceholderImage
                  className={cn("w-full", shape.container)}
                  aspectRatio="3/4"
                  label="MICROCORE"
                />
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
