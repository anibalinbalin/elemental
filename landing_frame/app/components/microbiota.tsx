"use client";

import DigestionIcon from "@hugeicons/core-free-icons/DigestionIcon";
import HappyIcon from "@hugeicons/core-free-icons/HappyIcon";
import Shield01Icon from "@hugeicons/core-free-icons/Shield01Icon";
import FlashIcon from "@hugeicons/core-free-icons/FlashIcon";
import Leaf01Icon from "@hugeicons/core-free-icons/Leaf01Icon";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";
import { PlaceholderImage } from "./placeholder-image";
import { SectionReveal } from "./section-reveal";
import { FeatureIcon } from "./feature-icon";

const features = [
  { label: "Digestion", icon: DigestionIcon },
  { label: "Estado de animo", icon: HappyIcon },
  { label: "Inflamacion", icon: Shield01Icon },
  { label: "Energia", icon: FlashIcon },
  { label: "Piel", icon: Leaf01Icon },
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
                <a
                  href="#producto"
                  className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  Ver formula
                </a>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <PlaceholderImage
              className={cn("w-full", shape.container)}
              aspectRatio="4/5"
              label="Microbiota"
            />
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
