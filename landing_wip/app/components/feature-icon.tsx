"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface FeatureIconProps {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  className?: string;
}

export function FeatureIcon({ label, icon, className }: FeatureIconProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center">
        <HugeiconsIcon
          icon={icon}
          size={20}
          strokeWidth={1.5}
          className="text-foreground"
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
