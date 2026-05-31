// One-off: optimize the Elemental Bloom source images (Drive export) into
// web-ready WebP assets under public/images. Run with: node scripts/optimize-eb-images.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = "/mnt/data/sites-sync/2026/elemental/elemental/links";
const OUT = path.resolve(import.meta.dirname, "../public/images");

// [source file, output slug, max long-edge px, keep alpha]
const JOBS = [
  ["3d-representation-microscopic-pathogens.jpg", "microbiota-bacteria", 1600, false],
  ["EB-Pack-Mockup-v4cropped.png", "product-pouch", 1300, true],
  ["ChatGPT Image 9 abr 2026, 14_42_36.png", "product-pedestal", 1300, true],
  ["imagen para wev Male.png", "mix-in-bowls", 1600, false],
  ["ChatGPT Image 8 abr 2026, 20_14_41.png", "founder", 1400, false],
  ["ChatGPT Image 20 may 2026, 13_32_36.png", "lifestyle-orange-water", 1200, false],
  ["assortment-healthy-recipe-with-oranges-COLOR.jpg", "recipe-orange-bread", 1200, false],
  ["close-up-women-with-measuring-scoop-whey-protein-shaker-bottle-preparing-protein-shake.jpg", "shaker", 1200, false],
  ["close-up-young-woman-preparing-food-eating-color.jpg", "pancakes", 1200, false],
  ["EB-1.jpg", "bloom-yellow", 1600, false],
  ["EB-4.jpg", "bloom-purple", 1600, false],
];

if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

for (const [file, slug, max, alpha] of JOBS) {
  const inPath = path.join(SRC, file);
  if (!existsSync(inPath)) {
    console.warn(`SKIP (missing): ${file}`);
    continue;
  }
  const outPath = path.join(OUT, `${slug}.webp`);
  const img = sharp(inPath).rotate().resize({
    width: max,
    height: max,
    fit: "inside",
    withoutEnlargement: true,
  });
  await img
    .webp({ quality: 82, alphaQuality: alpha ? 90 : 100, effort: 5 })
    .toFile(outPath);
  const meta = await sharp(outPath).metadata();
  const kb = (await sharp(outPath).toBuffer()).length / 1024;
  console.log(`${slug}.webp  ${meta.width}x${meta.height}  ${kb.toFixed(0)}KB`);
}
console.log("done →", OUT);
