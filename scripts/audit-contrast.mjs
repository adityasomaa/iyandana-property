/**
 * Contrast audit.
 *
 *   node scripts/audit-contrast.mjs
 *
 * Reads the colour tokens straight out of `src/app/globals.css` and checks
 * every pair the site actually puts on screen, one by one, against WCAG AA.
 * Reading the real file means the check cannot drift away from the design.
 *
 * Exits non-zero if any pair falls short.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const CSS = path.join(process.cwd(), "src", "app", "globals.css");
const source = await readFile(CSS, "utf8");

/** Pulls `--color-name: #hex;` declarations out of the `@theme` block. */
const tokens = Object.fromEntries(
  [...source.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [
    m[1],
    m[2].toLowerCase(),
  ]),
);

function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Every foreground/background pair the site renders, and the threshold it has
 * to clear. 4.5 for body text, 3 for large text and for the boundary of a
 * control, which is what WCAG 1.4.11 asks of a non-text UI component.
 */
const PAIRS = [
  // Page and raised surfaces
  ["ink", "paper", 4.5, "body text on the page"],
  ["ink-soft", "paper", 4.5, "secondary text on the page"],
  ["ink-faint", "paper", 4.5, "meta text on the page"],
  ["jade", "paper", 4.5, "prices and links on the page"],
  ["ink", "surface", 4.5, "body text on a card"],
  ["ink-soft", "surface", 4.5, "secondary text on a card"],
  ["ink-faint", "surface", 4.5, "meta text and placeholders on a card"],
  ["jade", "surface", 4.5, "section labels and prices on a card"],
  ["ink", "sunk", 4.5, "body text on a sunk band"],
  ["ink-soft", "sunk", 4.5, "secondary text on a sunk band"],
  ["ink-faint", "sunk", 4.5, "meta text on a sunk band"],
  ["jade", "sunk", 4.5, "section labels on a sunk band"],

  // Buttons
  ["on-jade", "jade", 4.5, "solid button label"],
  ["on-jade", "jade-deep", 4.5, "solid button label on hover"],
  ["ink", "paper", 4.5, "outline button label"],
  ["jade", "surface", 4.5, "outline button label on hover"],

  // Status chips
  ["sale-fg", "sale-bg", 4.5, "for-sale chip"],
  ["rent-fg", "rent-bg", 4.5, "for-rent chip"],
  ["sale-fg", "paper", 4.5, "form error text"],
  ["sale-fg", "surface", 4.5, "form error text on a card"],

  // Inverted surfaces
  ["on-ink", "ink", 4.5, "lightbox chrome"],

  // Control boundaries and focus, judged as non-text UI
  ["control", "paper", 3, "field border on the page"],
  ["control", "surface", 3, "field border on a card"],
  ["control", "sunk", 3, "field border on a sunk band"],
  ["jade", "paper", 3, "focus ring on the page"],
  ["jade", "surface", 3, "focus ring on a card"],
  ["jade", "sunk", 3, "focus ring on a sunk band"],
];

let failures = 0;
console.log(`checking ${PAIRS.length} colour pairs from ${path.relative(process.cwd(), CSS)}\n`);

for (const [fg, bg, min, label] of PAIRS) {
  const fgHex = tokens[fg];
  const bgHex = tokens[bg];
  if (!fgHex || !bgHex) {
    console.log(`FAIL  ${label}: token missing (${fg} / ${bg})`);
    failures++;
    continue;
  }
  const r = ratio(fgHex, bgHex);
  const ok = r >= min;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1  (min ${min})  ${label}  [${fg} ${fgHex} on ${bg} ${bgHex}]`,
  );
}

console.log(
  `\n${PAIRS.length - failures}/${PAIRS.length} pairs meet their threshold`,
);
if (failures) process.exit(1);
