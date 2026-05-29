// Bakes the particle color grade + LUT into the color texture, so the runtime
// fragment shader can drop the per-pixel lookup() (2 texture fetches) entirely.
//
// This replicates EXACTLY the GLSL grading in living-particle-system.tsx:
//   graded_A = mix(vColor, pow(vColor, 0.74) * TINT, L)
//   graded_B = mix(graded_A, lookup(graded_A), L)
// where lookup() is the classic 8x8 / 64-level LUT with NEAREST sampling and a
// blue-axis lerp between the two adjacent slices.
//
// Textures are sampled with no color-space conversion at runtime (colorSpace is
// never set), so all math here is in raw 0..1 byte space — matching the shader.
//
// Run: bun scripts/bake-lut.mjs   (or: node scripts/bake-lut.mjs)
// Output: public/creative-art-points/color_baked.png

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "public", "creative-art-points");

const L = 0.49; // DEFAULT_CONTROLS.lutIntensity (constant — not animated by keyframes)
const TINT = [1.03, 0.98, 0.92];

const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

const lutImg = await sharp(path.join(ROOT, "LUT.png"))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const LW = lutImg.info.width;
const LH = lutImg.info.height;
const LC = lutImg.info.channels;
const lut = lutImg.data;

// NEAREST sample of the LUT, matching WebGL (flipY=false => v=0 is the top row,
// which is also row 0 of sharp's top-origin raw buffer).
function sampleNearest(u, v) {
  let x = Math.floor(u * LW);
  let y = Math.floor(v * LH);
  if (x < 0) x = 0;
  else if (x >= LW) x = LW - 1;
  if (y < 0) y = 0;
  else if (y >= LH) y = LH - 1;
  const i = (y * LW + x) * LC;
  return [lut[i] / 255, lut[i + 1] / 255, lut[i + 2] / 255];
}

// Port of the GLSL lookup() function. Input is clamped to 0..1, as in the shader.
function lookup(r, g, b) {
  r = clamp01(r);
  g = clamp01(g);
  b = clamp01(b);
  const blue = b * 63.0;
  const fb = Math.floor(blue);
  const cb = Math.ceil(blue);

  const q1y = Math.floor(fb / 8.0);
  const q1x = fb - q1y * 8.0;
  const q2y = Math.floor(cb / 8.0);
  const q2x = cb - q2y * 8.0;

  const inset = 0.5 / 512.0;
  const span = 0.125 - 1.0 / 512.0;

  const tx1 = q1x * 0.125 + inset + span * r;
  const ty1 = q1y * 0.125 + inset + span * g;
  const tx2 = q2x * 0.125 + inset + span * r;
  const ty2 = q2y * 0.125 + inset + span * g;

  const c1 = sampleNearest(tx1, ty1);
  const c2 = sampleNearest(tx2, ty2);
  const f = blue - fb; // fract(blueColor)
  return [mix(c1[0], c2[0], f), mix(c1[1], c2[1], f), mix(c1[2], c2[2], f)];
}

function grade(r, g, b) {
  // step 1: tonal lift + tint, blended by L
  const aR = mix(r, Math.pow(r, 0.74) * TINT[0], L);
  const aG = mix(g, Math.pow(g, 0.74) * TINT[1], L);
  const aB = mix(b, Math.pow(b, 0.74) * TINT[2], L);
  // step 2 + 3: LUT applied to graded_A, blended back by L
  const lc = lookup(aR, aG, aB);
  return [mix(aR, lc[0], L), mix(aG, lc[1], L), mix(aB, lc[2], L)];
}

const colorImg = await sharp(path.join(ROOT, "color.png"))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = colorImg.info;
const src = colorImg.data;
const out = Buffer.alloc(src.length);

for (let i = 0; i < src.length; i += channels) {
  const [r, g, b] = grade(src[i] / 255, src[i + 1] / 255, src[i + 2] / 255);
  out[i] = Math.round(clamp01(r) * 255);
  out[i + 1] = Math.round(clamp01(g) * 255);
  out[i + 2] = Math.round(clamp01(b) * 255);
  if (channels === 4) out[i + 3] = src[i + 3]; // preserve alpha
}

const dest = path.join(ROOT, "color_baked.png");
await sharp(out, { raw: { width, height, channels } })
  .png()
  .toFile(dest);

console.log(`Baked ${width}x${height} -> ${dest}`);
