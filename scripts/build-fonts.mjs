/**
 * Converts the licensed Neue Montreal TTFs into self-hosted WOFF2.
 * Source files stay outside the repo; run this once when they are available:
 *   node scripts/build-fonts.mjs
 * Output lands in public/fonts and is committed so builds never need the TTFs.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { compress } from "wawoff2";

const SRC_DIR =
  process.env.NEUE_MONTREAL_DIR ?? "C:/Users/User/Downloads/NEUE MONTREAL";

const FACES = [
  { file: "NeueMontreal-Regular.ttf", out: "NeueMontreal-Regular.woff2" },
  { file: "NeueMontreal-Medium.ttf", out: "NeueMontreal-Medium.woff2" },
];

const OUT_DIR = path.join(process.cwd(), "public", "fonts");

await mkdir(OUT_DIR, { recursive: true });

for (const face of FACES) {
  const src = path.join(SRC_DIR, face.file);
  if (!existsSync(src)) {
    console.warn(`skip: ${src} not found`);
    continue;
  }
  const ttf = await readFile(src);
  const woff2 = await compress(ttf);
  const dest = path.join(OUT_DIR, face.out);
  await writeFile(dest, woff2);
  console.log(
    `${face.out}  ${(ttf.length / 1024).toFixed(0)}kb ttf -> ${(woff2.length / 1024).toFixed(0)}kb woff2`,
  );
}
