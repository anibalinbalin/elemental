import type { ComponentType } from "react";

/**
 * Lean stub of Fluid Functionalism's icon-context.
 *
 * FF's full icon-context wires a switchable icon library (lucide / hugeicons /
 * phosphor / tabler) via `@/lib/icon-map`, which pulls in all four icon
 * packages. The components we currently use (Button) only need the
 * `IconComponent` *type*, so we keep this minimal and avoid those deps.
 *
 * If you later `npx shadcn@latest add @fluid/<component>` for something that
 * needs the live icon switcher, let the CLI replace this file with the full
 * version (and add `@/lib/icon-map`).
 */
export type IconComponent = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}>;
