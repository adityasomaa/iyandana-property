/**
 * Generates every artwork tile the site needs.
 *   node scripts/build-tiles.mjs
 *
 * Reads listings straight from the single editable data file, so adding a
 * listing there and re-running this is all it takes to get its artwork.
 * Output is deterministic; re-running produces byte-identical files.
 */
import { writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { renderTile, TILE_TYPES } from "./lib/tile-art.mjs";

const OUT = path.join(process.cwd(), "public", "tiles");
await mkdir(OUT, { recursive: true });

// Start clean so listings removed from the data file do not leave orphans.
for (const f of await readdir(OUT).catch(() => [])) {
  if (f.endsWith(".svg")) await rm(path.join(OUT, f));
}

const { LISTINGS } = await import("../src/data/listings.ts");

let count = 0;
for (const listing of LISTINGS) {
  for (let v = 0; v < listing.views; v++) {
    const svg = renderTile(listing.type, `${listing.code}-${v}`, v);
    await writeFile(path.join(OUT, `${listing.code}-${v}.svg`), svg);
    count++;
  }
}

// One representative tile per type, for category cards and the construction page.
for (const type of TILE_TYPES) {
  const svg = renderTile(type, `type-${type}`, 0);
  await writeFile(path.join(OUT, `type-${type}.svg`), svg);
  count++;
}

// Extra construction panels for the workflow section on the construction page.
for (let v = 0; v < 3; v++) {
  const svg = renderTile("konstruksi", `konstruksi-panel-${v}`, v);
  await writeFile(path.join(OUT, `konstruksi-panel-${v}.svg`), svg);
  count++;
}

console.log(`${count} tiles written to public/tiles`);
