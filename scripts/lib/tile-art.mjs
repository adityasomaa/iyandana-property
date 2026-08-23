/**
 * Generative artwork for property tiles.
 *
 * One visual family across every tile: the same narrow green-grey hue band, the
 * same flat tonal planes, the same drafting-paper frame and hairline grid. What
 * changes between property types is the COMPOSITION, so a house, a villa, a
 * plot of land, a hotel and a construction project read apart at a glance.
 *
 * Nothing here imitates a photograph. There are no faces, no textures posing as
 * camera output, no logos. These are drawn diagrams, and the alt text says so.
 *
 * Everything is deterministic: the same (code, view) always produces the same
 * file, so the whole set can be regenerated at any time.
 */

const W = 1600;
const H = 1200;

/* ---------------------------------------------------------------- utilities */

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, and stable across Node versions. */
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hsl(h, s, l) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const r2 = (n) => Math.round(n * 100) / 100;

/** Tonal ramp for one tile. Hue stays inside a narrow band so every tile
 *  belongs to the same world regardless of type or seed. */
function palette(rand, view) {
  const hue = 152 + rand() * 26; // 152deg - 178deg: pine through slate-teal
  const warm = hue - 34; // the paper/haze side of the same family
  const lift = view * 3.2; // later views sit a touch brighter and further off
  return {
    paper: "#f4f2ec",
    skyTop: hsl(hue, 13, 88 + lift * 0.25),
    skyBottom: hsl(warm, 17, 80 + lift * 0.3),
    haze: hsl(warm, 22, 87),
    far: hsl(hue, 11, 70 - lift * 0.3),
    ground: hsl(warm, 12, 64 - lift * 0.25),
    apron: hsl(warm, 10, 72 - lift * 0.2),
    mid: hsl(hue, 14, 54 - lift * 0.4),
    near: hsl(hue, 17, 37 - lift * 0.3),
    deep: hsl(hue, 23, 21),
    glass: hsl(hue + 10, 26, 77),
    water: hsl(hue + 12, 25, 70),
    line: hsl(hue, 18, 30),
  };
}

function rect(x, y, w, h, fill, extra = "") {
  return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" fill="${fill}"${extra}/>`;
}

function poly(points, fill, extra = "") {
  const p = points.map(([x, y]) => `${r2(x)},${r2(y)}`).join(" ");
  return `<polygon points="${p}" fill="${fill}"${extra}/>`;
}

/* ------------------------------------------------------------ shared layers */

/** Sky, haze pool, ground plane and a paved apron. Used by every scene so the
 *  tiles sit on one continuous idea of a site. */
function site(p, horizon) {
  return [
    `<rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#sky)"/>`,
    `<ellipse cx="${W * 0.62}" cy="${horizon - 140}" rx="700" ry="330" fill="${p.haze}" opacity="0.5"/>`,
    rect(-200, horizon, W + 400, H + 200 - horizon, p.ground),
    // A paved apron in front of the subject keeps the lower third from reading
    // as a dead slab.
    rect(-200, horizon + 118, W + 400, 92, p.apron, ' opacity="0.75"'),
    `<line x1="-200" y1="${r2(horizon + 118)}" x2="${W + 200}" y2="${r2(horizon + 118)}" stroke="${p.line}" stroke-width="2" opacity="0.2"/>`,
    `<line x1="-200" y1="${r2(horizon + 210)}" x2="${W + 200}" y2="${r2(horizon + 210)}" stroke="${p.line}" stroke-width="2" opacity="0.2"/>`,
  ].join("");
}

/** Drafting hairlines. The one texture every tile shares. */
function gridLayer(p) {
  return `<g opacity="0.15" stroke="${p.line}" stroke-width="1.4">
    ${Array.from({ length: 23 }, (_, i) => `<line x1="${(i - 3) * 100}" y1="-200" x2="${(i - 3) * 100}" y2="${H + 200}"/>`).join("")}
    ${Array.from({ length: 17 }, (_, i) => `<line x1="-200" y1="${(i - 2) * 100}" x2="${W + 200}" y2="${(i - 2) * 100}"/>`).join("")}
  </g>`;
}

/** Soft contact shadow so masses sit on the ground instead of floating. */
function contactShadow(p, cx, y, rx) {
  return `<ellipse cx="${r2(cx)}" cy="${r2(y + 8)}" rx="${r2(rx)}" ry="22" fill="${p.deep}" opacity="0.16"/>`;
}

/**
 * Palm silhouette. Curved trunk, drooping fronds drawn as tapered leaves.
 * Every tile that plants anything plants this, so the vegetation is one voice.
 */
function palms(rand, p, horizon, count, spread) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x =
      spread[0] + ((spread[1] - spread[0]) * (i + 0.5)) / count + (rand() - 0.5) * 70;
    const h = 230 + rand() * 190;
    const lean = (rand() - 0.5) * 70;
    const topX = x + lean;
    const topY = horizon - h;
    const tw = 8 + rand() * 4;

    out += `<path d="M ${r2(x - tw)} ${r2(horizon)} Q ${r2(x + lean * 0.25)} ${r2(horizon - h * 0.55)} ${r2(topX - tw * 0.55)} ${r2(topY)} L ${r2(topX + tw * 0.55)} ${r2(topY)} Q ${r2(x + lean * 0.25 + tw * 1.6)} ${r2(horizon - h * 0.55)} ${r2(x + tw)} ${r2(horizon)} Z" fill="${p.deep}" opacity="0.9"/>`;

    const fronds = 7;
    const reach = 92 + rand() * 46;
    for (let f = 0; f < fronds; f++) {
      const t = f / (fronds - 1);
      const ang = -Math.PI * 0.96 + t * Math.PI * 0.92;
      const dx = Math.cos(ang) * reach * 1.7;
      const dy = Math.sin(ang) * reach * 0.85 + reach * 0.42;
      const midX = topX + dx * 0.55;
      const midY = topY + dy * 0.34 - reach * 0.3;
      const width = 15 + rand() * 6;
      out += `<path d="M ${r2(topX)} ${r2(topY)} Q ${r2(midX)} ${r2(midY)} ${r2(topX + dx)} ${r2(topY + dy)} Q ${r2(midX)} ${r2(midY + width)} ${r2(topX)} ${r2(topY + width * 0.5)} Z" fill="${p.deep}" opacity="0.82"/>`;
    }
    out += `<ellipse cx="${r2(topX)}" cy="${r2(topY + 6)}" rx="16" ry="12" fill="${p.deep}"/>`;
  }
  return out;
}

/* -------------------------------------------------------------- composition
 * Every scene returns { body, focus }. `focus` is the subject centroid, which
 * the view crop frames on, so panel 2 of a listing is genuinely a different
 * framing rather than the same picture nudged.
 * ------------------------------------------------------------------------ */

/** RUMAH — pitched roof volume plus a lower wing. Domestic silhouette. */
function houseScene(rand, p, view) {
  const horizon = 810;
  const bw = 600 + rand() * 90;
  const bx = 330 + rand() * 80;
  const bh = 300 + rand() * 55;
  const ridge = 195 + rand() * 50;
  const by = horizon - bh;
  const wingW = 250 + rand() * 70;
  const wingH = bh * 0.6;

  let windows = "";
  for (let c = 0; c < 3; c++) {
    for (let rw = 0; rw < 2; rw++) {
      const x = bx + 72 + c * ((bw - 144 - 74) / 2);
      const y = by + 70 + rw * 132;
      windows += rect(x, y, 74, 96, rw === 1 ? p.glass : p.water, ' opacity="0.95"');
      windows += rect(x, y, 74, 8, p.deep, ' opacity="0.3"');
    }
  }

  const body = [
    site(p, horizon),
    gridLayer(p),
    palms(rand, p, horizon, 2, [1180, 1520]),
    contactShadow(p, bx + bw / 2, horizon, bw * 0.72),
    rect(bx + bw - 40, horizon - wingH, wingW, wingH, p.mid),
    poly(
      [
        [bx + bw - 62, horizon - wingH],
        [bx + bw - 40 + wingW / 2, horizon - wingH - 98],
        [bx + bw + wingW - 18, horizon - wingH],
      ],
      p.near,
    ),
    rect(bx, by, bw, bh, p.mid),
    poly(
      [
        [bx - 48, by],
        [bx + bw / 2, by - ridge],
        [bx + bw + 48, by],
      ],
      p.near,
    ),
    rect(bx + bw - 98, by, 98, bh, p.near, ' opacity="0.42"'),
    windows,
    rect(bx + bw / 2 - 48, horizon - 136, 96, 136, p.deep),
    rect(bx + bw / 2 - 62, horizon - 150, 124, 16, p.near),
    rect(-200, horizon, W + 400, 8, p.deep, ' opacity="0.3"'),
  ].join("");

  return { body, focus: { x: bx + bw / 2, y: by + bh * 0.3 } };
}

/** VILLA — low horizontal pavilion, deep flat overhang, water in front. */
function villaScene(rand, p, view) {
  const horizon = 700;
  const bx = 260 + rand() * 60;
  const bw = 1000 + rand() * 110;
  const bh = 250 + rand() * 36;
  const by = horizon - bh;
  const eave = 60;
  const poolY = horizon + 140;
  const poolH = 210;
  const bays = 5 + Math.floor(rand() * 2);

  let columns = "";
  for (let i = 0; i <= bays; i++) {
    const x = bx + 46 + (i * (bw - 92)) / bays;
    columns += rect(x - 9, by + 54, 18, bh - 54, p.deep, ' opacity="0.9"');
  }

  const body = [
    site(p, horizon),
    gridLayer(p),
    palms(rand, p, horizon, 3, [40, 290]),
    palms(rand, p, horizon, 2, [1330, 1570]),
    contactShadow(p, bx + bw / 2, horizon, bw * 0.6),
    rect(bx + 46, by + 54, bw - 92, bh - 54, p.deep, ' opacity="0.55"'),
    rect(bx + 92, by + 98, bw - 184, bh - 152, p.glass, ' opacity="0.78"'),
    columns,
    rect(bx - eave, by, bw + eave * 2, 52, p.near),
    rect(bx - eave, by + 52, bw + eave * 2, 12, p.deep, ' opacity="0.4"'),
    rect(bx - eave - 14, by - 14, bw + eave * 2 + 28, 16, p.mid),
    rect(240, poolY, 1120, poolH, p.water),
    rect(240, poolY, 1120, 16, p.glass, ' opacity="0.9"'),
    rect(bx + 92, poolY + 34, bw - 184, 72, p.glass, ' opacity="0.3"'),
    rect(240, poolY + poolH, 1120, 10, p.deep, ' opacity="0.2"'),
  ].join("");

  return { body, focus: { x: bx + bw / 2, y: by + bh * 0.35 } };
}

/** TANAH — no building at all. Stepped terraces, boundary ticks, a marker. */
function landScene(rand, p, view) {
  const horizon = 520;
  const steps = 5 + Math.floor(rand() * 2);
  let terraces = "";
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const y = horizon + t * (H - horizon) * 0.9;
    const inset = (1 - t) * 140;
    const tone = [p.far, p.ground, p.mid, p.near][Math.min(3, Math.floor(t * 3.4))];
    const lift = 34 + rand() * 26;
    terraces += `<path d="M ${r2(-240 + inset * 0.4)} ${r2(y)} Q ${W / 2} ${r2(y - lift)} ${r2(W + 240 - inset * 0.4)} ${r2(y)} L ${W + 240} ${H + 200} L -240 ${H + 200} Z" fill="${tone}"/>`;
    terraces += `<path d="M ${r2(-240 + inset * 0.4)} ${r2(y)} Q ${W / 2} ${r2(y - lift)} ${r2(W + 240 - inset * 0.4)} ${r2(y)}" fill="none" stroke="${p.deep}" stroke-width="3" opacity="0.26"/>`;
    // planting rows on the wider terraces, so the land reads as worked ground
    if (t > 0.25) {
      const rows = 4;
      for (let k = 1; k <= rows; k++) {
        const ry = y + ((H - y) / (steps - i)) * (k / (rows + 1)) * 0.7;
        terraces += `<path d="M ${r2(-200 + inset * 0.3)} ${r2(ry)} Q ${W / 2} ${r2(ry - lift * 0.7)} ${r2(W + 200 - inset * 0.3)} ${r2(ry)}" fill="none" stroke="${p.deep}" stroke-width="1.6" opacity="0.13"/>`;
      }
    }
  }

  // Plot boundary drawn as corner ticks, the way a site plan marks extents.
  const m = 170;
  const tick = 104;
  const boundary = [
    [m, horizon + 90, 1, 1],
    [W - m, horizon + 90, -1, 1],
    [m, H - 140, 1, -1],
    [W - m, H - 140, -1, -1],
  ]
    .map(
      ([x, y, dx, dy]) =>
        `<path d="M ${r2(x + dx * tick)} ${r2(y)} L ${r2(x)} ${r2(y)} L ${r2(x)} ${r2(y + dy * tick)}" fill="none" stroke="${p.paper}" stroke-width="7" stroke-linecap="square" opacity="0.9"/>`,
    )
    .join("");

  // A boundary post with a cross-tick head: a survey marker, not a flag.
  const sx = 470 + rand() * 640;
  const sy = H - 340;
  const sh = 230;
  const marker = [
    rect(sx - 6, sy - sh, 12, sh, p.deep),
    rect(sx - 52, sy - sh, 104, 12, p.deep),
    rect(sx - 30, sy - sh + 44, 60, 10, p.deep, ' opacity="0.75"'),
    `<circle cx="${sx}" cy="${r2(sy - sh - 22)}" r="13" fill="${p.deep}"/>`,
    `<ellipse cx="${sx}" cy="${r2(sy + 6)}" rx="42" ry="12" fill="${p.deep}" opacity="0.18"/>`,
  ].join("");

  const body = [
    site(p, horizon),
    gridLayer(p),
    `<path d="M -240 ${horizon} L 300 ${r2(horizon - 138)} L 660 ${r2(horizon - 50)} L 1040 ${r2(horizon - 166)} L 1380 ${r2(horizon - 64)} L ${W + 240} ${r2(horizon - 112)} L ${W + 240} ${horizon} Z" fill="${p.far}" opacity="0.9"/>`,
    palms(rand, p, horizon + 40, 2, [60, 300]),
    terraces,
    marker,
    boundary,
  ].join("");

  return { body, focus: { x: W / 2, y: horizon + (H - horizon) * 0.42 } };
}

/** HOTEL — stacked floor bands over a wider podium, plus a lower wing. */
function hotelScene(rand, p, view) {
  const horizon = 900;
  const floors = 5 + Math.floor(rand() * 3);
  const bw = 560 + rand() * 90;
  const bx = 480 + rand() * 60;
  const fh = 94;
  const towerH = floors * fh;
  const by = horizon - 155 - towerH;

  let bands = "";
  for (let i = 0; i < floors; i++) {
    const y = by + i * fh;
    bands += rect(bx, y, bw, fh, i % 2 ? p.mid : p.near, ' opacity="0.96"');
    bands += rect(bx + 40, y + 22, bw - 80, 46, p.glass, ' opacity="0.9"');
    bands += rect(bx + 40, y + 60, bw - 80, 8, p.deep, ' opacity="0.28"');
    bands += rect(bx, y + fh - 8, bw, 8, p.deep, ' opacity="0.32"');
  }

  const wingW = 300 + rand() * 90;
  const wingH = 240;

  const body = [
    site(p, horizon),
    gridLayer(p),
    palms(rand, p, horizon, 2, [80, 330]),
    palms(rand, p, horizon, 1, [1400, 1560]),
    contactShadow(p, bx + bw / 2, horizon, bw * 0.95),
    rect(bx - wingW + 30, horizon - wingH, wingW, wingH, p.far),
    rect(bx - wingW + 30, horizon - wingH, wingW, 16, p.mid),
    bands,
    rect(bx - 28, by - 36, bw + 56, 36, p.deep),
    rect(bx - 155, horizon - 155, bw + 310, 155, p.near),
    rect(bx - 155, horizon - 155, bw + 310, 18, p.deep, ' opacity="0.5"'),
    rect(bx - 60, horizon - 112, 320, 112, p.glass, ' opacity="0.85"'),
    rect(bx - 94, horizon - 132, 388, 22, p.deep),
    rect(-200, horizon, W + 400, 10, p.deep, ' opacity="0.32"'),
  ].join("");

  return { body, focus: { x: bx + bw / 2, y: by + towerH * 0.45 } };
}

/** KOMERSIAL — a repeating bay grid under one continuous awning. */
function commercialScene(rand, p, view) {
  const horizon = 840;
  const bays = 4 + Math.floor(rand() * 3);
  const bx = 210;
  const bw = 1180;
  const levels = 2 + (rand() > 0.55 ? 1 : 0);
  const lh = 205;
  const bh = levels * lh;
  const by = horizon - bh;
  const bayW = bw / bays;

  let grid = "";
  for (let l = 0; l < levels; l++) {
    for (let b = 0; b < bays; b++) {
      const x = bx + b * bayW;
      const y = by + l * lh;
      grid += rect(
        x + 26,
        y + 42,
        bayW - 52,
        lh - 86,
        l === levels - 1 ? p.deep : p.glass,
        ' opacity="0.9"',
      );
      grid += rect(x + 26, y + 42, bayW - 52, 10, p.deep, ' opacity="0.28"');
    }
    grid += rect(bx, by + l * lh, bw, 14, p.deep, ' opacity="0.33"');
  }

  const body = [
    site(p, horizon),
    gridLayer(p),
    palms(rand, p, horizon, 1, [1450, 1570]),
    contactShadow(p, bx + bw / 2, horizon, bw * 0.58),
    rect(bx, by, bw, bh, p.mid),
    grid,
    Array.from({ length: bays + 1 }, (_, i) =>
      rect(bx + i * bayW - 8, by, 16, bh, p.near),
    ).join(""),
    rect(bx - 30, by - 48, bw + 60, 48, p.near),
    // Blank signage band. Deliberately empty: no invented shop names.
    rect(bx + 60, by - 40, bw - 120, 34, p.deep, ' opacity="0.5"'),
    rect(bx - 46, horizon - lh + 14, bw + 92, 20, p.deep),
    poly(
      [
        [bx - 46, horizon - lh + 34],
        [bx + bw + 46, horizon - lh + 34],
        [bx + bw + 8, horizon - lh + 100],
        [bx - 8, horizon - lh + 100],
      ],
      p.near,
      ' opacity="0.72"',
    ),
    rect(-200, horizon, W + 400, 10, p.deep, ' opacity="0.32"'),
  ].join("");

  return { body, focus: { x: bx + bw / 2, y: by + bh * 0.45 } };
}

/** KONSTRUKSI — structural frame mid-build, with a tower crane over it. */
function constructionScene(rand, p, view) {
  const horizon = 920;
  const cols = 5;
  const levels = 4;
  const bx = 300;
  const bw = 820;
  const lh = 152;
  const by = horizon - levels * lh;
  const colW = 26;
  const bayW = (bw - colW) / (cols - 1);

  let frameWork = "";
  for (let l = 0; l <= levels; l++) {
    const y = by + l * lh;
    const w = l === 0 ? bw + 44 : bw;
    const x = l === 0 ? bx - 22 : bx;
    frameWork += rect(x, y - 16, w, 22, l === 0 ? p.near : p.mid);
  }
  for (let c = 0; c < cols; c++) {
    frameWork += rect(bx + c * bayW, by, colW, levels * lh, p.near);
  }
  const filled = 1 + Math.floor(rand() * (cols - 2));
  frameWork += rect(bx + filled * bayW, by + lh, bayW, lh * 2, p.deep, ' opacity="0.55"');
  const braced = filled === 1 ? cols - 2 : 1;
  for (let l = 0; l < levels; l++) {
    const x = bx + braced * bayW + colW;
    const y = by + l * lh;
    frameWork += `<path d="M ${r2(x)} ${r2(y)} L ${r2(x + bayW - colW)} ${r2(y + lh)} M ${r2(x + bayW - colW)} ${r2(y)} L ${r2(x)} ${r2(y + lh)}" stroke="${p.deep}" stroke-width="7" opacity="0.5" fill="none"/>`;
  }

  const mx = 1300;
  const mastTop = 170;
  const jibY = mastTop + 72;
  const crane = [
    rect(mx - 20, mastTop, 40, horizon - mastTop, p.deep),
    Array.from({ length: 9 }, (_, i) => {
      const y = mastTop + 44 + i * ((horizon - mastTop - 44) / 9);
      return `<path d="M ${mx - 20} ${r2(y)} L ${mx + 20} ${r2(y + 46)} M ${mx + 20} ${r2(y)} L ${mx - 20} ${r2(y + 46)}" stroke="${p.deep}" stroke-width="5" opacity="0.7" fill="none"/>`;
    }).join(""),
    rect(mx - 740, jibY, 740, 18, p.deep),
    rect(mx + 20, jibY, 195, 18, p.deep),
    rect(mx + 152, jibY - 48, 62, 48, p.deep),
    rect(mx - 36, jibY - 80, 72, 80, p.deep),
    `<line x1="${mx - 480}" y1="${jibY + 18}" x2="${mx - 480}" y2="${jibY + 310}" stroke="${p.deep}" stroke-width="5"/>`,
    rect(mx - 512, jibY + 310, 64, 36, p.deep),
  ].join("");

  const body = [
    site(p, horizon),
    gridLayer(p),
    contactShadow(p, bx + bw / 2, horizon, bw * 0.62),
    crane,
    frameWork,
    // Site hoarding across the front, drawn last so it occludes the frame base.
    rect(-200, horizon - 78, W + 400, 78, p.far),
    rect(-200, horizon - 78, W + 400, 10, p.near),
    Array.from({ length: 12 }, (_, i) =>
      rect(-160 + i * 150, horizon - 78, 5, 78, p.ground, ' opacity="0.7"'),
    ).join(""),
    rect(-200, horizon, W + 400, 12, p.deep, ' opacity="0.36"'),
  ].join("");

  return { body, focus: { x: bx + bw * 0.6, y: by + levels * lh * 0.45 } };
}

const SCENES = {
  rumah: houseScene,
  villa: villaScene,
  tanah: landScene,
  hotel: hotelScene,
  komersial: commercialScene,
  konstruksi: constructionScene,
};

/**
 * How each panel of a gallery is framed. Panel 0 is the full elevation; the
 * rest push in on the subject from different sides, so a four-panel gallery
 * shows one property four ways instead of the same picture four times.
 */
const VIEW_CROPS = [
  { zoom: 1, ox: 0, oy: 0 },
  { zoom: 0.68, ox: -0.1, oy: 0.05 },
  { zoom: 0.84, ox: 0.15, oy: 0.09 },
  { zoom: 0.6, ox: 0.06, oy: 0.03 },
];

/**
 * Renders one tile.
 * @param {string} type one of the SCENES keys
 * @param {string} seedKey stable identity, normally `${code}-${view}`
 * @param {number} view 0-based panel index; picks the framing
 */
export function renderTile(type, seedKey, view = 0) {
  const scene = SCENES[type] ?? SCENES.rumah;
  const rand = rng(hashSeed(seedKey));
  const p = palette(rand, view);
  const { body, focus } = scene(rand, p, view);

  const crop = VIEW_CROPS[view % VIEW_CROPS.length];
  const vw = W * crop.zoom;
  const vh = H * crop.zoom;
  // Frame on the subject, then clamp so the crop never leaves the drawn area.
  const cx = focus.x + crop.ox * W;
  const cy = focus.y + crop.oy * H;
  const vx = Math.max(-120, Math.min(W + 120 - vw, cx - vw / 2));
  const vy = Math.max(-120, Math.min(H + 120 - vh, cy - vh / 2));

  const inset = 34 * crop.zoom;
  const frame = `<rect x="${r2(vx + inset)}" y="${r2(vy + inset)}" width="${r2(vw - inset * 2)}" height="${r2(vh - inset * 2)}" fill="none" stroke="${p.paper}" stroke-width="${r2(3 * crop.zoom)}" opacity="0.6"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(vx)} ${r2(vy)} ${r2(vw)} ${r2(vh)}" width="${W}" height="${H}" role="img" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${p.skyTop}"/><stop offset="1" stop-color="${p.skyBottom}"/>
</linearGradient></defs>
${body}
${frame}
</svg>`;
}

export const TILE_TYPES = Object.keys(SCENES);
