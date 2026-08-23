/**
 * Two timelines, sampled from a real browser.
 *
 *   node scripts/timeline.mjs <baseUrl>
 *
 * 1. What covers the front page, sampled every 250ms from load to 5s. This is
 *    the check the whole preview exists for: nothing may sit over the content.
 * 2. The actual frame-by-frame values of the loaders and the route curtain, so
 *    the motion can be shown to move rather than assumed to.
 */
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] ?? "https://iyandanaproperty.vercel.app").replace(/\/$/, "");
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Users/User/AppData/Local/Google/Chrome/Application/chrome.exe";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

/* ------------------------------------------ 1. front page coverage timeline */

{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => {
    window.__t0 = performance.now();
  });
  await page.goto(`${BASE}/id`, { waitUntil: "domcontentloaded" });

  console.log("front page: what covers the viewport, sampled to 5s\n");
  const rows = [];
  for (let i = 0; i <= 20; i++) {
    const row = await page.evaluate(() => {
      const w = innerWidth;
      const h = innerHeight;
      const covering = [];
      for (const el of document.querySelectorAll("body *")) {
        const s = getComputedStyle(el);
        if (s.position !== "fixed" && s.position !== "absolute") continue;
        if (s.display === "none" || s.visibility === "hidden") continue;
        if (Number(s.opacity) < 0.05) continue;
        const r = el.getBoundingClientRect();
        const area =
          Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0)) *
          Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
        if (area > w * h * 0.5) {
          covering.push({
            what: `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`,
            interactive: s.pointerEvents !== "none",
          });
        }
      }

      // Area alone is a poor test: the hero backdrop sits behind the content on
      // a negative z-index and the idle curtain paints nothing at all, yet both
      // are large positioned elements. What actually matters is whether the
      // page is reachable, so nine points across the viewport are hit-tested
      // and anything that is not page content counts as an obstruction.
      const obstructions = new Set();
      for (const fx of [0.15, 0.5, 0.85]) {
        for (const fy of [0.15, 0.5, 0.85]) {
          const hit = document.elementFromPoint(w * fx, h * fy);
          if (!hit) continue;
          const isContent =
            hit.closest("#main") ||
            hit.closest("header") ||
            hit.closest("footer") ||
            hit.tagName === "BODY" ||
            hit.tagName === "HTML";
          if (!isContent) {
            obstructions.add(
              `${hit.tagName.toLowerCase()}.${(hit.className || "").toString().split(" ")[0]}`,
            );
          }
        }
      }
      const search = document.querySelector("#hero-keyword");
      const rect = search?.getBoundingClientRect();
      const hit = rect
        ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        : null;
      return {
        ms: Math.round(performance.now() - window.__t0),
        covering,
        obstructions: [...obstructions],
        searchReachable: Boolean(search && (hit === search || search.contains(hit))),
      };
    });
    rows.push(row);
    await new Promise((r) => setTimeout(r, 250));
  }

  for (const row of rows) {
    const blocking = row.obstructions.length ? row.obstructions.join(", ") : "nothing";
    console.log(
      `  ${String(row.ms).padStart(5)}ms  in front of the page: ${blocking.padEnd(22)} search reachable: ${row.searchReachable}`,
    );
  }

  const afterIntro = rows.filter((r) => r.ms >= 1600);
  const clean = afterIntro.every(
    (r) => r.obstructions.length === 0 && r.searchReachable,
  );
  const introGone = rows.find((r) => r.obstructions.length === 0);
  console.log(
    `\n  the intro clears at ${introGone ? `${introGone.ms}ms` : "never"}` +
      `\n  1.6s to 5s: ${clean ? "nothing in front of the page at any sample, and the search stays reachable throughout" : "SOMETHING IS IN FRONT OF THE PAGE"}`,
  );
  await page.close();
}

/* --------------------------------------------- 2. motion actually progresses */

{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("\nintro loader: position over time");
  await page.goto(`${BASE}/id`, { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 8; i++) {
    const state = await page.evaluate(() => {
      const el = document.querySelector("[data-intro-loader]");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { transform: s.transform, visibility: s.visibility, top: el.getBoundingClientRect().top };
    });
    console.log(`  +${i * 200}ms  ${state ? `${state.transform} visibility=${state.visibility} top=${Math.round(state.top)}` : "removed from the page"}`);
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\nroute curtain: slat position through one navigation");
  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1800));
  await page.evaluate(() => {
    const link = [...document.querySelectorAll("a")].find((a) =>
      a.getAttribute("href")?.endsWith("/id/konstruksi"),
    );
    link?.click();
  });
  for (let i = 0; i < 16; i++) {
    const state = await page.evaluate(() => {
      const curtain = document.querySelector(".curtain");
      const slat = document.querySelector(".curtain__slat");
      const last = document.querySelectorAll(".curtain__slat")[4];
      return {
        phase: curtain?.getAttribute("data-phase"),
        first: slat ? getComputedStyle(slat).transform : "",
        last: last ? getComputedStyle(last).transform : "",
        pointer: curtain ? getComputedStyle(curtain).pointerEvents : "",
        path: location.pathname,
        scroll: Math.round(window.scrollY),
      };
    });
    console.log(
      `  +${String(i * 150).padStart(4)}ms  phase=${String(state.phase).padEnd(8)} slat1=${state.first.padEnd(30)} slat5=${state.last.padEnd(30)} pointer=${state.pointer} path=${state.path} y=${state.scroll}`,
    );
    await new Promise((r) => setTimeout(r, 150));
  }
  await page.close();
}

await browser.close();
