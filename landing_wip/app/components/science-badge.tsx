import { cn } from "@/lib/utils";

/**
 * Lime circular seal from the brand key art: "CIENCIA CLARA · DESARROLLADA EN
 * URUGUAY" set around a central asterisk (the Elemental Bloom mark). The text
 * ring rotates slowly; the asterisk and disc stay put. Honors reduced-motion.
 *
 * Sized by the caller via `className` width (it's aspect-square).
 */
export function ScienceBadge({
  className,
  spin = true,
}: {
  className?: string;
  /** Rotate the text ring. Set false for a static sticker. */
  spin?: boolean;
}) {
  return (
    <div className={cn("relative aspect-square select-none", className)}>
      {/* Disc + central asterisk — static. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="50" fill="#C7E94C" />
        {/* 6-arm asterisk built from 3 crossed capsules. */}
        <g fill="#141414">
          {[0, 60, 120].map((deg) => (
            <rect
              key={deg}
              x="46.4"
              y="31"
              width="7.2"
              height="38"
              rx="3.6"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </g>
      </svg>

      {/* Rotating text ring. */}
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "absolute inset-0 h-full w-full",
          spin && "motion-safe:animate-[badge-spin_22s_linear_infinite]",
        )}
      >
        <defs>
          <path
            id="science-badge-arc"
            fill="none"
            d="M 50,50 m -39,0 a 39,39 0 1,1 78,0 a 39,39 0 1,1 -78,0"
          />
        </defs>
        <text
          fill="#141414"
          fontFamily="var(--font-mono), monospace"
          fontSize="8.1"
          fontWeight={600}
          letterSpacing="0.6"
        >
          <textPath
            href="#science-badge-arc"
            startOffset="0"
            textLength="245"
            lengthAdjust="spacing"
          >
            CIENCIA CLARA · DESARROLLADA EN URUGUAY ·
          </textPath>
        </text>
      </svg>
    </div>
  );
}
