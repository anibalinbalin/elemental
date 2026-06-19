"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import { ScienceBadge } from "./science-badge";

/**
 * The CIENCIA CLARA seal as a peel-and-stick page sticker — the tgs_nextjs
 * method (PlacedPageSticker + StickerResidue), page-wide:
 *   • drag it ANYWHERE on the page (document coordinates, scrolls with content)
 *   • hover / lift peels a corner; lifting it off a spot leaves a torn-adhesive
 *     residue ghost behind that STAYS there (like real residue).
 *
 * Renders through a portal into <body> (page-level overlay) but is mounted in
 * the section via a hidden anchor so it first lands at the section's top-right.
 *
 * The drop-shadow and residue look are live-tunable via DialKit (dev only —
 * the panel auto-hides in production; bake the chosen values + drop dialkit
 * before shipping, per project policy).
 */
const W = 120;
const ROTATION = -6;
const MARGIN = 26;
const TAP_PX = 6;
const LIFT_PEEL = 22;
// Adhesive wears out: each successive peel leaves fainter residue, and after the
// 3rd it leaves none at all (the 4th spot onward is "clean").
const RESIDUE_STRENGTHS = [1, 0.6, 0.32];

type Pt = { x: number; y: number };
type Ghost = Pt & { id: number; strength: number };

type Dials = {
  shadow: { x: number; y: number; blur: number; opacity: number; color: string };
  residue: {
    tint: string;
    opacity: number;
    edgeFreq: number;
    displace: number;
    patchFreq: number;
    blend: string;
  };
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const int = parseInt(n || "000000", 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function ScienceSticker() {
  const dev = process.env.NODE_ENV === "development";
  const d = useDialKit("CIENCIA CLARA · sticker", {
    shadow: {
      x: [0, -24, 24, 1],
      y: [0, -24, 36, 1],
      blur: [2, 0, 48, 1],
      opacity: [0, 0, 0.8, 0.01],
      color: "#000000",
    },
    residue: {
      tint: "#e6e6e5",
      opacity: [0.64, 0.1, 1, 0.02],
      edgeFreq: [0.1, 0.005, 0.16, 0.005],
      displace: [6, 0, 30, 1],
      patchFreq: [0.065, 0.004, 0.12, 0.001],
      blend: { type: "select", options: ["multiply", "darken", "normal", "overlay", "soft-light", "color-burn"] },
    },
  }) as Dials;

  const s = hexToRgb(d.shadow.color);
  const stickerShadow = `drop-shadow(${d.shadow.x}px ${d.shadow.y}px ${d.shadow.blur}px rgba(${s.r},${s.g},${s.b},${d.shadow.opacity}))`;

  const anchorRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);
  const peelRef = useRef<HTMLDivElement>(null);
  const hoverProxy = useRef({ peel: 0 });
  const hoverTween = useRef<gsap.core.Tween | null>(null);
  const pointerDown = useRef(false);
  const dragging = useRef(false);
  const downPos = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const startPos = useRef<Pt | null>(null);
  const ghostId = useRef(0);
  const liftCount = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Pt | null>(null);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const section = anchorRef.current?.parentElement;
    if (!section) return;
    const r = section.getBoundingClientRect();
    setPos({
      x: r.right + window.scrollX - MARGIN - W / 2,
      y: r.top + window.scrollY + MARGIN + W / 2,
    });
  }, []);

  useEffect(() => {
    const el = stickerRef.current;
    if (!el || !pos) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const proxy = { s: 0.6 };
    el.style.scale = "0.6";
    const tl = gsap
      .timeline()
      .to(proxy, { s: 1.06, duration: 0.25, ease: "back.out(2.4)", onUpdate: () => (el.style.scale = String(proxy.s)) })
      .to(proxy, { s: 1, duration: 0.15, ease: "power2.out", onUpdate: () => (el.style.scale = String(proxy.s)), onComplete: () => (el.style.scale = "") });
    return () => void tl.kill();
  }, [pos !== null]); // eslint-disable-line react-hooks/exhaustive-deps -- run once after first placement

  const setPeel = useCallback((v: number) => {
    peelRef.current?.style.setProperty("--sticker-peelback-drag", `${v}%`);
  }, []);

  const tweenPeel = useCallback(
    (to: number, duration: number, ease: string) => {
      const c = peelRef.current;
      if (!c) return;
      hoverTween.current?.kill();
      if (to > 0) c.classList.add("sticker-peel-hover");
      hoverTween.current = gsap.to(hoverProxy.current, {
        peel: to,
        duration,
        ease,
        onUpdate: () => setPeel(hoverProxy.current.peel),
        onComplete: () => to === 0 && c.classList.remove("sticker-peel-hover"),
      });
    },
    [setPeel],
  );

  const handleEnter = useCallback(() => {
    if (!pointerDown.current) tweenPeel(24, 0.35, "power2.out");
  }, [tweenPeel]);

  const handleLeave = useCallback(() => {
    if (!pointerDown.current) tweenPeel(0, 0.2, "power2.in");
  }, [tweenPeel]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = stickerRef.current;
    if (!el || !pos) return;
    e.preventDefault();
    pointerDown.current = true;
    dragging.current = false;
    downPos.current = { x: e.clientX, y: e.clientY };
    startPos.current = pos;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    offset.current = { x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height / 2) };
    el.style.cursor = "grabbing";
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerDown.current) return;
    if (!dragging.current) {
      if (Math.hypot(e.clientX - downPos.current.x, e.clientY - downPos.current.y) <= TAP_PX) return;
      dragging.current = true;
      hoverProxy.current.peel = Math.max(hoverProxy.current.peel, LIFT_PEEL);
      tweenPeel(LIFT_PEEL, 0.18, "power2.out");
      if (startPos.current) {
        const here = startPos.current;
        const stage = liftCount.current++;
        // Fainter each peel; nothing left once the adhesive is spent. Residues
        // that do appear persist — never trimmed, like a real adhesive mark.
        if (stage < RESIDUE_STRENGTHS.length) {
          const strength = RESIDUE_STRENGTHS[stage];
          setGhosts((g) => [...g, { ...here, id: ghostId.current++, strength }]);
        }
      }
    }
    setPos({ x: e.clientX - offset.current.x + window.scrollX, y: e.clientY - offset.current.y + window.scrollY });
  }, [tweenPeel]);

  const handlePointerUp = useCallback(() => {
    pointerDown.current = false;
    if (stickerRef.current) stickerRef.current.style.cursor = "grab";
    if (dragging.current) tweenPeel(0, 0.3, "power2.out");
    dragging.current = false;
  }, [tweenPeel]);

  return (
    <>
      <div ref={anchorRef} className="hidden" aria-hidden />
      {dev && <DialRoot position="bottom-right" theme="dark" />}
      {mounted && pos &&
        createPortal(
          <div className="pointer-events-none absolute left-0 top-0 z-[60] w-full" style={{ height: 0 }}>
            {ghosts.map((g) => (
              <Residue key={g.id} at={g} p={d.residue} strength={g.strength} />
            ))}
            <div
              ref={stickerRef}
              className="page-sticker group pointer-events-auto absolute cursor-grab touch-none select-none"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: W,
                height: W,
                transform: `translate(-50%, -50%) rotate(${ROTATION}deg)`,
              }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div
                ref={peelRef}
                className="sticker-container"
                style={
                  {
                    "--sticker-p": "10px",
                    "--sticker-width": `${W}px`,
                    "--peel-direction": "0deg",
                    "--sticker-peelback-hover": "calc(-1 * var(--sticker-p))",
                    "--sticker-peelback-active": "calc(-1 * var(--sticker-p))",
                    pointerEvents: "none",
                    width: "100%",
                    height: "100%",
                  } as CSSProperties
                }
              >
                <div className="sticker-main size-full" style={{ filter: stickerShadow }}>
                  <ScienceBadge spin={false} className="size-full" />
                </div>
                <div className="flap">
                  <div className="flap-back" style={{ width: "var(--sticker-width)" }} aria-hidden />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/** Torn-adhesive ghost left on the surface after the seal is peeled off a spot. */
function Residue({ at, p, strength }: { at: Pt; p: Dials["residue"]; strength: number }) {
  const fid = useId().replace(/:/g, "");
  const t = hexToRgb(p.tint);
  const opacity = p.opacity * strength;
  // Force React to recreate the filter SVG when params change (browsers cache
  // SVG filters aggressively, so in-place attr updates wouldn't show live).
  const key = `${p.edgeFreq}-${p.displace}-${p.patchFreq}-${p.tint}-${opacity}`;
  return (
    <div
      className="sticker-residue pointer-events-none absolute select-none overflow-hidden"
      style={{
        left: `${at.x}px`,
        top: `${at.y}px`,
        width: W,
        height: W,
        transform: `translate(-50%, -50%) rotate(${ROTATION}deg)`,
      }}
      aria-hidden
    >
      <div className="absolute inset-0" style={{ filter: `url(#${fid})`, mixBlendMode: p.blend as CSSProperties["mixBlendMode"] }}>
        <div className="absolute inset-0" style={{ borderRadius: "50%", backgroundColor: `rgba(0,0,0,${opacity})` }} />
      </div>
      <svg key={key} width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id={fid} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency={`${p.edgeFreq} ${p.edgeFreq * 1.1}`} numOctaves={2} seed={7} result="edge" />
            <feDisplacementMap in="SourceGraphic" in2="edge" scale={p.displace} xChannelSelector="R" yChannelSelector="G" result="torn" />
            <feTurbulence type="fractalNoise" baseFrequency={p.patchFreq} numOctaves={2} seed={42} result="patch" />
            <feColorMatrix in="patch" type="luminanceToAlpha" result="patchA" />
            <feComponentTransfer in="patchA" result="patchMask">
              <feFuncA type="table" tableValues="0 0.08 0.25 0.45 0.65 0.82 0.93 1 1" />
            </feComponentTransfer>
            <feComposite in="torn" in2="patchMask" operator="in" result="patched" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={99} result="grain" />
            <feColorMatrix in="grain" type="luminanceToAlpha" result="grainA" />
            <feComponentTransfer in="grainA" result="grainMask">
              <feFuncA type="table" tableValues="0.55 0.62 0.7 0.78 0.84 0.9 0.94 0.98 1" />
            </feComponentTransfer>
            <feComposite in="patched" in2="grainMask" operator="in" result="grained" />
            <feColorMatrix
              in="grained"
              type="matrix"
              values={`0 0 0 0 ${t.r / 255}
                       0 0 0 0 ${t.g / 255}
                       0 0 0 0 ${t.b / 255}
                       0 0 0 1 0`}
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
