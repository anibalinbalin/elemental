"use client";

// Faithful port of the marj loupe (Loupe/Loupe.tsx). Changes are limited to:
// imports rewired to local deps + the project cn helper, the `tailwindcss/colors`
// JS import inlined to hex (Tailwind v4 dropped that export), and `z-100` →
// `z-[100]` (not in v4's default z scale). Behaviour is otherwise unchanged.
import {
  motion,
  Point,
  useAnimation,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import {
  clamp,
  drawGrid,
  setupHiDPICtx,
  Stamp,
  useIsMobile,
  usePlayLoupeZoomClick,
  useStampStore,
} from "./deps";
import Dial from "./Dial";
import Lens from "./Lens";
import LivingNoiseCanvas from "./living-noise-canvas";
import { useLoupeStore } from "./store";

const MemoizedLens = memo(Lens);

// Inlined stone palette (was `tailwindcss/colors`).
const STONE_100 = "#f5f5f4";
const STONE_200 = "#e7e5e4";
const STONE_300 = "#d6d3d1";

function getPointerOffsetFromElementCenter(point: Point, element?: HTMLElement | null) {
  if (!element) {
    return { x: 0, y: 0 };
  }
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return { x: point.x - centerX, y: point.y - centerY };
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
  });
}

async function loadFirstImage(srcs: string[]) {
  for (const src of srcs) {
    const img = await loadImage(src);
    if (img) {
      return img;
    }
  }
  return null;
}

const initial = {
  opacity: 0,
};

const directionKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Shift"];
const loupeScaleClickIncrement = 0.012;
const loupeScaleClickMinIntervalMs = 20;

// Drag-follow smoothing. The bezel transform AND the magnified content are both
// driven from this one spring, so they move as a single locked unit (no desync
// judder) and the raw per-frame pointer steps get interpolated into a glide.
// bounce:0 — a microscope is a precision instrument, never overshoots. Keep the
// visualDuration short so the glass tracks tightly with just a touch of weight:
// nudge it UP for more lag/heft, toward 0 for a snappier (eventually choppier) 1:1
// follow. This is pure motion smoothing — it never touches the render resolution.
const loupeFollowSpring = { visualDuration: 0.1, bounce: 0 } as const;

function Loupe({
  selectedStamp,
  dragConstraints,
  className,
  baseScale,
  gridCellSize,
  activeStampContainerRef,
  onReady,
  sourceFit = "stamp",
  livingNoise = false,
  sizeScale = 1,
}: {
  selectedStamp: Stamp;
  dragConstraints: React.RefObject<HTMLElement | null>;
  className?: string;
  baseScale: number;
  gridCellSize: number;
  activeStampContainerRef: React.RefObject<HTMLElement | null>;
  onReady?: (stampId: string) => void;
  /** Multiplier on the lens + dial sizes (e.g. 0.7 = 30% smaller). */
  sizeScale?: number;
  // "stamp" (default): the original demo look — a centered stamp on a stone grid.
  // "cover": sample the real image full-bleed (background-size: cover) so the lens
  // content lines up with a page that paints the same image, e.g. the homepage card.
  sourceFit?: "stamp" | "cover";
  // Overlay the animated microscope shimmer so the lens reads as a live microscope
  // (mirrors the production loupe's `.loupe-canvas`). Off for the faithful demo.
  livingNoise?: boolean;
}) {
  const setCoords = useLoupeStore((s) => s.setCoords);
  const setScale = useLoupeStore((s) => s.setScale);
  const scale = useLoupeStore((s) => s.scale);
  const playLoupeZoomClick = usePlayLoupeZoomClick();

  const isMobile = useIsMobile();
  const isZoomed = useStampStore((s) => s.isZoomed);

  const lensSize = (isMobile ? 135 : 300) * sizeScale;
  const dialSize = (isMobile ? 190 : 400) * sizeScale;

  const magnifierControls = useAnimation();

  // Single source of truth for the loupe's position. `targetX/Y` is the raw,
  // clamped destination (set instantly by pointer drag / arrow keys); `x/y` is
  // the spring-smoothed transform that the bezel actually renders. The bezel
  // (style transform) and the lens content (via the store bridge below) both read
  // x/y, so they can never drift apart. Holds the bezel's top-left offset, i.e.
  // center − radius — matching the old framer drag transform.
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const springX = useSpring(targetX, loupeFollowSpring);
  const springY = useSpring(targetY, loupeFollowSpring);

  // Respect prefers-reduced-motion: consume the raw target (instant follow) instead
  // of the spring. The spring hooks still run (stable hook order); we just don't
  // read their smoothed output. Direct manipulation, so no lag for sensitive users.
  const reduceMotion = useReducedMotion();
  const x = reduceMotion ? targetX : springX;
  const y = reduceMotion ? targetY : springY;

  // Bridge the (smoothed) transform into the shared store as the lens *center*
  // (transform + radius). The Lens shader reads these coords each frame, so the
  // magnified content stays locked to the glass. Fires only when the value
  // actually moves — idle when the loupe is at rest.
  const syncCoords = useCallback(() => {
    const radius = dialSize / 2;
    setCoords({ x: x.get() + radius, y: y.get() + radius });
  }, [x, y, dialSize, setCoords]);
  useMotionValueEvent(x, "change", syncCoords);
  useMotionValueEvent(y, "change", syncCoords);

  const draggingMagnifier = useRef(false);
  const draggingMagnifierRefOffset = useRef<{ x: number; y: number } | null>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const pressedKeysRef = useRef<Set<string>>(new Set());
  const rafTimeRef = useRef<number | null>(null);
  const lastScaleClickStepRef = useRef(Math.round(scale / loupeScaleClickIncrement));
  const lastScaleClickAtRef = useRef(0);

  // Cached container rect: drag only moves a compositor transform, so the card's
  // box stays put. Measuring it once per drag (refreshed on scroll/resize) avoids
  // a forced layout/reflow on every pointermove — the main-thread jank that made
  // dragging feel laggy.
  const containerRectRef = useRef<DOMRect | null>(null);
  const refreshContainerRect = useCallback(() => {
    containerRectRef.current = dragConstraints.current?.getBoundingClientRect() ?? null;
  }, [dragConstraints]);

  useEffect(() => {
    const onViewportChange = () => {
      if (draggingMagnifier.current) refreshContainerRect();
    };
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);
    return () => {
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [refreshContainerRect]);

  useEffect(() => {
    if (!dragConstraints?.current) {
      return;
    }

    if (isZoomed) {
      // Rest in the top-right corner (the draggable clamp limit) so the loupe sits
      // off-center and partly overhangs the frame — a built-in hint that it's meant
      // to be picked up and moved. radius = dialSize / 2 keeps the bezel tangent to
      // the top and right edges, matching the clamp bounds so the first drag never
      // jumps.
      const radius = dialSize / 2;
      const restX = dragConstraints.current.offsetWidth - radius;
      const restY = radius;
      setCoords({ x: restX, y: restY });

      // Snap (not spring) to the rest corner on open so the loupe doesn't glide in
      // from 0,0 — jump() sets the target and the smoothed value together.
      targetX.set(restX - radius);
      targetY.set(restY - radius);
      x.jump(restX - radius);
      y.jump(restY - radius);

      magnifierControls.start({
        opacity: 1,
        filter: "blur(0px)",
      });
    } else {
      magnifierControls.start({
        opacity: 0,
        filter: "blur(10px)",
      });
    }
  }, [isZoomed, magnifierControls, dragConstraints, setCoords, dialSize, targetX, targetY, x, y]);

  const [canvasData, setCanvasData] = useState<{
    source: HTMLCanvasElement | HTMLImageElement;
    cssWidth: number;
    cssHeight: number;
  } | null>(null);

  const handleScaleChange = useCallback(
    (nextScale: number) => {
      setScale(nextScale);

      const nextStep = Math.round(nextScale / loupeScaleClickIncrement);
      if (nextStep === lastScaleClickStepRef.current) {
        return;
      }

      const now = performance.now();
      lastScaleClickStepRef.current = nextStep;

      if (now - lastScaleClickAtRef.current < loupeScaleClickMinIntervalMs) {
        return;
      }

      lastScaleClickAtRef.current = now;
      playLoupeZoomClick();
    },
    [playLoupeZoomClick, setScale],
  );

  useEffect(() => {
    const container = dragConstraints.current;
    if (!container) {
      return;
    }

    // Cover mode (homepage): sample the full-resolution image directly, exactly
    // like the production glass loupe, so the lens reveals the real grain instead
    // of a downsampled snapshot. No grid, no intermediate canvas.
    if (sourceFit === "cover") {
      let cancelled = false;
      loadFirstImage([selectedStamp.srcLg, selectedStamp.src]).then((img) => {
        if (cancelled || !img) {
          return;
        }
        setCanvasData({
          source: img,
          cssWidth: container.offsetWidth,
          cssHeight: container.offsetHeight,
        });
      });
      return () => {
        cancelled = true;
      };
    }

    // Stamp mode (the original demo): composite a stone grid + centered stamp into
    // a container-sized canvas and sample that.
    const canvas = document.createElement("canvas");
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const { ctx } = setupHiDPICtx(
      canvas,
      container.offsetWidth,
      container.offsetHeight,
      typeof window !== "undefined" ? window.devicePixelRatio : 1,
    );
    if (!ctx) {
      return;
    }

    const stampImgEl =
      activeStampContainerRef.current?.querySelector(`[data-slot="stamp-image"]`) ||
      document.querySelector(`[data-id="${selectedStamp.id}"] [data-slot="stamp-image"]`);
    if (!stampImgEl) {
      return;
    }

    drawGrid(ctx, {
      width: container.offsetWidth,
      height: container.offsetHeight,
      align: "top",
      cellWidth: gridCellSize,
      cellHeight: gridCellSize,
      background: STONE_100,
      foreground: isMobile ? STONE_200 : STONE_300,
      lineWidth: 1,
    });

    loadFirstImage([selectedStamp.srcLg, selectedStamp.src])
      .then((img) => {
        if (!img) {
          return;
        }

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 20;

        const imgWidth = stampImgEl.clientWidth * baseScale;
        const imgHeight = stampImgEl.clientHeight * baseScale;

        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;

        ctx.drawImage(img, centerX - imgWidth / 2, centerY - imgHeight / 2, imgWidth, imgHeight);
      })
      .finally(() => {
        setCanvasData({
          source: canvas,
          cssWidth: container.offsetWidth,
          cssHeight: container.offsetHeight,
        });
      });
  }, [
    isMobile,
    lensSize,
    selectedStamp,
    dragConstraints,
    baseScale,
    gridCellSize,
    activeStampContainerRef,
    sourceFit,
  ]);

  useEffect(() => {
    if (!canvasData) {
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        onReady?.(selectedStamp.id);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [canvasData, onReady, selectedStamp.id]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      draggingMagnifier.current = true;
      refreshContainerRect();
      // Capture the pointer to the trigger so pointermove/up keep targeting it
      // even when the cursor outruns the bezel on a fast flick, or the bezel
      // clamps at a constraint edge while the cursor keeps going. Without this
      // the cursor crosses out of the trigger box, pointermove stops firing here
      // (coords freeze), and pointerleave used to kill the whole drag — the
      // "drag stops mid-drag" bug. Capture also suppresses pointerleave for the
      // duration of the gesture, so it can no longer cancel us.
      event.currentTarget.setPointerCapture(event.pointerId);
      triggerRef.current?.setAttribute("data-dragging", "true");

      const draggableCoords = getPointerOffsetFromElementCenter(
        { x: event.clientX, y: event.clientY },
        event.currentTarget,
      );

      draggingMagnifierRefOffset.current = {
        x: draggableCoords.x,
        y: draggableCoords.y,
      };
    },
    [draggingMagnifier, draggingMagnifierRefOffset, refreshContainerRect],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingMagnifier.current) return;
      const rect = containerRectRef.current;
      if (!rect) return;

      const pointerX = event.clientX - rect.left - (draggingMagnifierRefOffset.current?.x ?? 0);
      const pointerY = event.clientY - rect.top - (draggingMagnifierRefOffset.current?.y ?? 0);

      const radius = dialSize / 2;
      const clampedX = clamp(radius, rect.width - radius, pointerX);
      const clampedY = clamp(radius, rect.height - radius, pointerY);

      // Feed the spring target only — the spring drives both the bezel transform
      // and (via the store bridge) the lens content, so they stay locked + smooth.
      targetX.set(clampedX - radius);
      targetY.set(clampedY - radius);
    },
    [draggingMagnifier, draggingMagnifierRefOffset, dialSize, targetX, targetY],
  );

  const endDrag = useCallback(() => {
    draggingMagnifier.current = false;
    triggerRef.current?.removeAttribute("data-dragging");
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      endDrag();
    },
    [endDrag],
  );

  const style = useMemo(
    () =>
      ({
        "--lens-size": `${lensSize}px`,
        "--dial-size": `${dialSize}px`,
      }) as CSSProperties,
    [lensSize, dialSize],
  );

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isZoomed) return;
      if (directionKeys.includes(e.key)) {
        pressedKeysRef.current.add(e.key);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isZoomed],
  );

  const handleTriggerKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (directionKeys.includes(e.key)) {
      pressedKeysRef.current.delete(e.key);
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const onBlur = useCallback(() => {
    pressedKeysRef.current.clear();
  }, []);

  useAnimationFrame((t) => {
    const container = dragConstraints.current;
    if (!container || !isZoomed) {
      rafTimeRef.current = t;
      return;
    }

    const prev = rafTimeRef.current ?? t;
    const dt = Math.min(0.05, (t - prev) / 1000);
    rafTimeRef.current = t;

    if (!pressedKeysRef.current.size) {
      return;
    }

    const pressedKeys = pressedKeysRef.current;

    const speed = 200 * (pressedKeys.has("Shift") ? 2 : 1);
    let vx = 0;
    let vy = 0;
    if (pressedKeys.has("ArrowLeft")) vx -= 1;
    if (pressedKeys.has("ArrowRight")) vx += 1;
    if (pressedKeys.has("ArrowUp")) vy -= 1;
    if (pressedKeys.has("ArrowDown")) vy += 1;
    if (!(vx || vy)) {
      return;
    }

    const len = Math.hypot(vx, vy) || 1;
    vx /= len;
    vy /= len;

    const radius = dialSize / 2;

    // Integrate from the spring *target* (not the smoothed value) so the lag never
    // compounds, then feed the new target back to the same spring that drives the
    // pointer drag — arrow-key moves get the identical smooth follow.
    const cx = targetX.get() + radius;
    const cy = targetY.get() + radius;
    const newX = cx + vx * speed * dt;
    const newY = cy + vy * speed * dt;

    const clampedX = clamp(radius, container.offsetWidth - radius, newX);
    const clampedY = clamp(radius, container.offsetHeight - radius, newY);

    targetX.set(clampedX - radius);
    targetY.set(clampedY - radius);
  });

  return (
    <motion.div
      data-zoomed={isZoomed}
      initial={initial}
      animate={magnifierControls}
      style={{ x, y, ...style }}
      className={cn(
        // NOTE: classes are namespaced `marj-loupe*` (not `loupe*`) on purpose —
        // the homepage graft ships a GLOBAL public/loupe.css that styles `.loupe`,
        // `.loupe-trigger`, `.loupe-lens`. Sharing those names lets that CSS hijack
        // this component (transparent bezel + a black inset-shadow vignette).
        'marj-loupe absolute z-[100] flex aspect-square w-(--dial-size) items-center justify-center rounded-full bg-black shadow-md shadow-black/30 outline-offset-8 [&:has(.marj-loupe-trigger:focus-visible)]:outline-stone-400 [&:has(.marj-loupe-trigger:focus-visible)]:outline-dashed [&[data-zoomed="false"]_.marj-loupe-lens]:pointer-events-none!',
        "shadow-md",
        className,
      )}
    >
      <div
        ref={triggerRef}
        className={cn(
          'marj-loupe-trigger pointer-events-auto absolute inset-0 top-1/2 left-1/2 z-[100] aspect-square w-(--lens-size) -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full [box-shadow:0_0_3px_3px_rgba(0,0,0,0.2)_inset] focus-visible:outline-none data-[dragging="true"]:cursor-grabbing data-[zoomed="false"]:pointer-events-none',
          {
            "pointer-events-none": !isZoomed,
          },
        )}
        role="region"
        tabIndex={0}
        aria-label="Stamps Loupe"
        aria-describedby="stamps-loupe-description"
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={handleTriggerKeyDown}
        onKeyUp={handleTriggerKeyUp}
        onBlur={onBlur}
      />
      <MemoizedLens
        image={canvasData?.source}
        width={lensSize}
        height={lensSize}
        sourceWidth={canvasData?.cssWidth}
        sourceHeight={canvasData?.cssHeight}
        ior={1.4}
        chromaticAberration={0.01}
        // Stronger glass objective: a fatter dome (oblateZScale) and more edge
        // refraction (refractionScale) make it read as a microscope — more bend
        // and depth at the rim — without leaning on source resolution we don't have.
        oblateZScale={0.62}
        refractionScale={0.72}
        className={cn("marj-loupe-lens")}
      />
      {livingNoise && (
        <LivingNoiseCanvas
          size={lensSize}
          className="marj-loupe-noise pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ zIndex: 40, opacity: 0.6 }}
        />
      )}
      <Dial
        key={isMobile ? "mobile" : "desktop"}
        className="marj-loupe-dial pointer-events-none absolute inset-0 z-50"
        inscription="ELEMENTAL  ·  10× MICROBIOTA MICROSCOPE  ·  elementalbloomco.com"
        size={dialSize}
        sizeScale={sizeScale}
        tickCount={isMobile ? 120 : 180}
        tickLength={isMobile ? 4 : 8}
        tickWidth={1}
        tickColor={STONE_200}
        snapAngle={10}
        stiffness={500}
        damping={50}
        value={scale}
        step={0.01}
        onChange={handleScaleChange}
        minAngle={0}
        minValue={1}
        maxValue={8}
        maxAngle={360}
        disabled={!isZoomed}
      />
      <p id="stamps-loupe-description" className="sr-only">
        Use arrow keys to move the loupe. Press Tab to switch between local controls.
      </p>
    </motion.div>
  );
}

export default Loupe;
