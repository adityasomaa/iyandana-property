/**
 * Brand asset pipeline. Deterministic, re-runnable:
 *   node scripts/build-brand.mjs
 *
 * The client's existing mark (public/brand/logo-source.png) is a grayscale
 * circular badge on an opaque light square. A site icon must sit on any
 * background, so this script keys the square away and keeps only the badge
 * disc, with a feathered edge, then writes the PNG sizes the app references.
 *
 * The source file is never modified. Nothing here invents or redraws the mark.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { decodePng, encodePng, resize } from "./lib/png.mjs";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public", "brand", "logo-source.png");
const OUT = path.join(ROOT, "public", "brand");

await mkdir(OUT, { recursive: true });

const img = decodePng(await readFile(SRC));
const { width: w, height: h } = img;

// The badge is centred in the source square. Measure its radius by walking out
// from the centre until the pixels settle back into the flat light surround.
const cx = (w - 1) / 2;
const cy = (h - 1) / 2;
const corner = img.data[(4 * (w * 4 + 4)) + 0]; // a pixel well inside the margin
const lum = (x, y) => img.data[(Math.round(y) * w + Math.round(x)) * 4];

let radius = 0;
for (let r = Math.min(cx, cy); r > 4; r -= 0.5) {
  let onMark = 0;
  const samples = 180;
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    if (x < 0 || y < 0 || x > w - 1 || y > h - 1) continue;
    if (Math.abs(lum(x, y) - corner) > 24) onMark++;
  }
  if (onMark / samples > 0.9) {
    radius = r;
    break;
  }
}
if (!radius) throw new Error("could not locate the badge disc in the source");

// Trim a hair so the source's own antialiased rim does not survive as a halo.
radius -= 1;

const masked = Buffer.alloc(w * h * 4);
const FEATHER = 1.25;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const d = Math.hypot(x - cx, y - cy);
    let a = 1;
    if (d > radius) a = Math.max(0, 1 - (d - radius) / FEATHER);
    masked[i] = img.data[i];
    masked[i + 1] = img.data[i + 1];
    masked[i + 2] = img.data[i + 2];
    masked[i + 3] = Math.round(img.data[i + 3] * a);
  }
}

// Crop to the disc so the icon fills its own box instead of floating in margin.
const pad = 1;
const x0 = Math.max(0, Math.floor(cx - radius - pad));
const y0 = Math.max(0, Math.floor(cy - radius - pad));
const size = Math.min(
  Math.ceil(radius * 2 + pad * 2),
  Math.min(w - x0, h - y0),
);
const cropped = Buffer.alloc(size * size * 4);
for (let y = 0; y < size; y++) {
  masked.copy(
    cropped,
    y * size * 4,
    ((y + y0) * w + x0) * 4,
    ((y + y0) * w + x0 + size) * 4,
  );
}
const disc = { width: size, height: size, data: cropped };

for (const px of [512, 180, 96, 32]) {
  const scaled = px === size ? disc : resize(disc, px, px);
  await writeFile(path.join(OUT, `mark-${px}.png`), encodePng(scaled));
  console.log(`mark-${px}.png`);
}

// Browsers ask for /favicon.ico whether or not the page links one, so ship a
// real ICO. The format allows a PNG payload, so the transparent 32px mark goes
// in as-is rather than being re-encoded into a bitmap that loses its alpha.
const icoPng = encodePng(resize(disc, 32, 32));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
const entry = Buffer.alloc(16);
entry[0] = 32; // width
entry[1] = 32; // height
entry[2] = 0; // palette size
entry[3] = 0; // reserved
entry.writeUInt16LE(1, 4); // colour planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(icoPng.length, 8);
entry.writeUInt32LE(22, 12); // offset of the payload
await writeFile(
  path.join(ROOT, "public", "favicon.ico"),
  Buffer.concat([header, entry, icoPng]),
);
console.log("favicon.ico");

console.log(
  `source ${w}x${h} -> disc r=${radius.toFixed(1)} cropped ${size}x${size}, background keyed to transparent`,
);
