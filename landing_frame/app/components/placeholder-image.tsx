import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  className?: string;
  aspectRatio?: string;
  label?: string;
}

export function PlaceholderImage({
  className,
  aspectRatio = "4/3",
  label,
}: PlaceholderImageProps) {
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
