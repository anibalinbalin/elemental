import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  className?: string;
  aspectRatio?: string;
  label?: string;
  /** When set, renders the image filling the aspect-ratio box. */
  src?: string;
  /** Alt text — required for accessibility whenever `src` is set. */
  alt?: string;
  /** `cover` (default) for photos, `contain` for transparent product shots. */
  fit?: "cover" | "contain";
}

export function PlaceholderImage({
  className,
  aspectRatio = "4/3",
  label,
  src,
  alt,
  fit = "cover",
}: PlaceholderImageProps) {
  if (src) {
    return (
      <div
        className={cn("relative overflow-hidden bg-neutral-200 dark:bg-neutral-700", className)}
        style={{ aspectRatio }}
      >
        <img
          src={src}
          alt={alt ?? label ?? ""}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full",
            fit === "contain" ? "object-contain" : "object-cover"
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center",
        className
      )}
      style={{ aspectRatio }}
    >
      {label && (
        <span className="text-muted-foreground text-sm font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
