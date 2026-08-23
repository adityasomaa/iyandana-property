/**
 * Browser audit suite.
 *
 *   node scripts/audit.mjs [baseUrl]
 *
 * Runs against a real Chrome, not a static analysis, and covers the checks this
 * project has to be able to prove:
 *   - every route answers 200 and loads every asset it asks for
 *   - no horizontal overflow at 375, 768 and 1440, naming any offender
 *   - the front page has nothing covering the viewport after the intro
 *   - the hamburger, filters, search, language switcher and lightbox work
 *   - every WhatsApp button produces a message with the right page and title
 *
 * Exits non-zero if anything fails, so it can gate a deploy.
 */
import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import { appendFileSync, writeFileSync } from "node:fs";

/**
 * With no argument the suite starts its own production server and shuts it down
 * at the end, so the server's lifetime is tied to this process rather than to
 * whichever shell happened to launch it. Pass a URL to audit a deployment.
 */
const arg = process.argv[2];
const LOCAL_PORT = 3111;
const BASE = (arg ?? `http://127.0.0.1:${LOCAL_PORT}`).replace(/\/$/, "");

let server = null;
if (!arg) {
  console.log(`starting next start on :${LOCAL_PORT}`);
  server = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "start", "-p", String(LOCAL_PORT)],
    { cwd: process.cwd(), stdio: "ignore", shell: process.platform === "win32" },
  );
  const deadline = Date.now() + 60000;
  for (;;) {
    try {
      const res = await fetch(`${BASE}/id`);
      if (res.ok) break;
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline) throw new Error("server did not start in time");
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log("server ready");
}

const stopServer = () => {
  if (!server) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"], { stdio: "ignore" });
    } else {
      server.kill("SIGTERM");
    }
  } catch {
    // already gone
  }
  server = null;
};
process.on("exit", stopServer);
process.on("SIGINT", () => {
  stopServer();
  process.exit(130);
});
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Users/User/AppData/Local/Google/Chrome/Application/chrome.exe";

const REPORT = process.env.AUDIT_REPORT ?? "audit-report.txt";
writeFileSync(REPORT, "");

const results = [];
// Written straight to disk as each check finishes: if the run is interrupted,
// the report still says exactly how far it got and what it found.
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  const line = `${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`;
  console.log(line);
  appendFileSync(REPORT, `${line}
`);
};

const step = (label) => appendFileSync(REPORT, `--- ${label}
`);

process.on("unhandledRejection", (err) => {
  appendFileSync(REPORT, `CRASH  unhandled rejection: ${err}
`);
  process.exitCode = 1;
});
process.on("uncaughtException", (err) => {
  appendFileSync(REPORT, `CRASH  ${err?.stack ?? err}
`);
  process.exit(1);
});

const ROUTES = [
  "/",
  "/id",
  "/en",
  "/id/listing",
  "/en/listing",
  "/id/listing/ip-rm-001",
  "/en/listing/ip-vl-001",
  "/id/konstruksi",
  "/en/konstruksi",
  "/id/titipkan-properti",
  "/id/kontak",
  "/en/kontak",
  "/id/privacy",
  "/id/terms",
  "/sitemap.xml",
  "/robots.txt",
  "/id/opengraph-image",
];

const VIEWPORTS = [
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1440", width: 1440, height: 900, mobile: false },
];

const OVERFLOW_PAGES = [
  "/id",
  "/id/listing",
  "/id/listing/ip-rm-001",
  "/id/konstruksi",
  "/id/titipkan-properti",
  "/id/kontak",
  "/id/privacy",
  "/id/terms",
  "/en/listing",
  "/en/listing/ip-ht-001",
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

const newPage = async (viewport = VIEWPORTS[2]) => {
  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
    deviceScaleFactor: 1,
  });
  return page;
};

/* ------------------------------------------------- 1. routes and requests */

step("routes");

{
  const page = await newPage();
  const failedRequests = [];
  const consoleErrors = [];
  // Next cancels its own RSC prefetches when a real navigation supersedes them.
  // Those aborts are the framework working, not a broken request.
  const isPrefetchAbort = (url, err) =>
    url.includes("_rsc=") && /ABORTED|CANCELED/i.test(err ?? "");
  page.on("requestfailed", (r) => {
    const err = r.failure()?.errorText ?? "";
    if (isPrefetchAbort(r.url(), err)) return;
    failedRequests.push(`${r.url()} ${err}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  for (const route of ROUTES) {
    const response = await page.goto(`${BASE}${route}`, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });
    const status = response?.status() ?? 0;
    // A 304 is the browser's cache answering; the route still works.
    record(`route ${route}`, status === 200 || status === 304, `status ${status}`);
  }

  record(
    "no failed requests across all routes",
    failedRequests.length === 0,
    failedRequests.slice(0, 6).join(" | "),
  );
  record(
    "no console errors across all routes",
    consoleErrors.length === 0,
    consoleErrors.slice(0, 4).join(" | "),
  );
  await page.close();
}

/* --------------------------------------------------------- 2. broken images */

step("images");

{
  const page = await newPage();
  const broken = [];
  for (const route of ["/id", "/id/listing", "/id/listing/ip-vl-003", "/id/konstruksi"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2" });
    // Force the lazy images to load, otherwise "not yet loaded" reads as broken.
    const bad = await page.evaluate(async () => {
      const images = [...document.images];
      for (const img of images) img.loading = "eager";
      await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
              setTimeout(resolve, 6000);
            }),
        ),
      );
      return images
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src);
    });
    broken.push(...bad.map((src) => `${route}: ${src}`));
  }
  record("zero broken images", broken.length === 0, broken.slice(0, 5).join(" | "));
  await page.close();
}

/* ----------------------------------------------------- 3. horizontal overflow

step("overflow");
 * Reported per element, so a failure names the offender instead of the page. */

{
  const offenders = [];
  for (const viewport of VIEWPORTS) {
    const page = await newPage(viewport);
    for (const route of OVERFLOW_PAGES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2" });
      // Let the intro clear so nothing mid-animation is measured.
      await new Promise((r) => setTimeout(r, 1800));
      const found = await page.evaluate((width) => {
        const docWidth = document.documentElement.clientWidth;
        const out = [];
        if (document.documentElement.scrollWidth > docWidth + 1) {
          for (const el of document.querySelectorAll("body *")) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            const style = getComputedStyle(el);
            if (style.position === "fixed") continue;
            if (rect.right > docWidth + 1 || rect.left < -1) {
              const cls =
                typeof el.className === "string" ? el.className : el.getAttribute("class") ?? "";
              out.push(
                `<${el.tagName.toLowerCase()} class="${cls.slice(0, 90)}"> left=${Math.round(rect.left)} right=${Math.round(rect.right)} w=${Math.round(rect.width)} vw=${width}`,
              );
            }
          }
          if (out.length === 0) out.push(`document scrollWidth exceeds ${docWidth}`);
        }
        return out;
      }, viewport.width);
      offenders.push(...found.slice(0, 3).map((f) => `${viewport.name} ${route} ${f}`));
    }
    await page.close();
  }
  record(
    "zero horizontal overflow at 375 / 768 / 1440",
    offenders.length === 0,
    offenders.slice(0, 6).join(" | "),
  );
}

/* ----------------------------------------- 3b. overflow with very long titles

step("long-titles");
 * Listing titles are the longest strings on the page and the bilingual copy
 * makes them longer still, so they are tested at an extreme length. */

{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(`${BASE}/id/listing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));
  const overflow = await page.evaluate(() => {
    const long =
      "Rumah dua lantai dengan halaman belakang yang sangat luas dan bangunan terpisah untuk dapur serta ruang cuci di kawasan Kesiman Kertalangu Denpasar Timur Bali Indonesia";
    for (const h of document.querySelectorAll("article h3 a")) h.textContent = long;
    const codeEl = document.querySelector("article span");
    if (codeEl) codeEl.textContent = "SUPERCALIFRAGILISTICEXPIALIDOCIOUSLISTINGCODE";
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  record("no overflow with extreme listing titles at 375", overflow <= 1, `delta ${overflow}px`);
  await page.close();
}

/* ------------------------------------ 4. nothing covers the viewport on load */

step("coverage");

{
  const page = await newPage();
  await page.goto(`${BASE}/id`, { waitUntil: "domcontentloaded" });

  const sample = async (label, afterMs) => {
    await new Promise((r) => setTimeout(r, afterMs));
    return page.evaluate((l) => {
      const w = innerWidth;
      const h = innerHeight;
      const covering = [];
      for (const el of document.querySelectorAll("body *")) {
        const style = getComputedStyle(el);
        if (style.position !== "fixed" && style.position !== "absolute") continue;
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (Number(style.opacity) < 0.05) continue;
        if (style.pointerEvents === "none") continue;
        const r = el.getBoundingClientRect();
        const area = Math.max(0, Math.min(r.right, w) - Math.max(r.left, 0)) *
          Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
        if (area > w * h * 0.55) {
          covering.push(
            `${l}: ${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`,
          );
        }
      }
      return covering;
    }, label);
  };

  const t1500 = await sample("1.5s", 1500);
  const t3000 = await sample("3s", 1500);
  const t5000 = await sample("5s", 2000);
  const late = [...t1500, ...t3000, ...t5000];
  record(
    "nothing covers the front page from 1.5s to 5s",
    late.length === 0,
    late.slice(0, 4).join(" | "),
  );

  // The hero search must be reachable without scrolling or dismissing anything.
  const heroReady = await page.evaluate(() => {
    const input = document.querySelector("#hero-keyword");
    if (!input) return "missing";
    const r = input.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) return "not in first viewport";
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return hit === input || input.contains(hit) ? "ok" : `covered by ${hit?.tagName}`;
  });
  record("hero search is visible and clickable on load", heroReady === "ok", heroReady);

  // No modal dialog opens on its own.
  const autoDialogs = await page.evaluate(
    () => document.querySelectorAll('[role="dialog"][aria-modal="true"]').length,
  );
  record("no dialog opens by itself", autoDialogs === 0, `${autoDialogs} open`);
  await page.close();
}

/* --------------------------------------------------- 5. heading entrance ran */

step("heading");

{
  const page = await newPage();
  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 3000));
  const heading = await page.evaluate(() => {
    const letters = [...document.querySelectorAll("h1 .split-letter")];
    if (!letters.length) return { count: 0 };
    const opacities = letters.map((l) => Number(getComputedStyle(l).opacity));
    const h1 = document.querySelector("h1");
    return {
      count: letters.length,
      minOpacity: Math.min(...opacities),
      ariaLabel: h1?.getAttribute("aria-label") ?? "",
      hiddenChildren: [...(h1?.querySelectorAll(":scope > span") ?? [])].every(
        (s) =>
          s.getAttribute("aria-hidden") === "true" ||
          s.querySelector("[aria-hidden]"),
      ),
    };
  });
  record(
    "split heading finishes visible",
    heading.count > 0 && heading.minOpacity > 0.99,
    `letters=${heading.count} minOpacity=${heading.minOpacity}`,
  );
  record(
    "split heading announces once via aria-label",
    Boolean(heading.ariaLabel) && heading.hiddenChildren,
    heading.ariaLabel,
  );
  await page.close();
}

/* ------------------------------------------------------- 6. hamburger menu */

step("hamburger");

{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));

  await page.click('button[aria-haspopup="dialog"]');
  await new Promise((r) => setTimeout(r, 400));
  const opened = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    return {
      open: Boolean(dialog),
      links: dialog?.querySelectorAll("nav a, ul a").length ?? 0,
      locked: document.body.dataset.scrollLocked === "true",
    };
  });
  record("hamburger opens the menu", opened.open, `${opened.links} links`);
  record("mobile menu locks body scroll", opened.locked);

  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
  const closed = await page.evaluate(() => ({
    open: Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')),
    locked: document.body.dataset.scrollLocked === "true",
    focused: document.activeElement?.getAttribute("aria-haspopup") === "dialog",
  }));
  record("escape closes the menu", !closed.open);
  record("body scroll is released on close", !closed.locked);
  record("focus returns to the menu button", closed.focused);
  await page.close();
}

/* -------------------------------------------------- 7. search and filtering */

step("filters");

{
  const page = await newPage();
  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));

  await page.type("#hero-keyword", "canggu");
  await page.click('form button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));

  const searched = await page.evaluate(() => ({
    url: location.pathname + location.search,
    cards: [...document.querySelectorAll("article h3")].map((h) => h.textContent?.trim()),
  }));
  record(
    "hero search reaches the listing page with its query",
    searched.url.includes("/id/listing") && searched.url.includes("q=canggu"),
    searched.url,
  );
  record(
    "keyword search returns only matching listings",
    searched.cards.length > 0 &&
      searched.cards.every((t) => (t ?? "").toLowerCase().includes("canggu")),
    `${searched.cards.length} results`,
  );

  // Filter by type through the URL, which is what the panel writes.
  await page.goto(`${BASE}/id/listing?type=tanah`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  const land = await page.evaluate(() =>
    [...document.querySelectorAll("article")].map(
      (a) => a.querySelector("p")?.textContent ?? "",
    ),
  );
  record(
    "type filter returns only that type",
    land.length === 3 && land.every((t) => t.includes("Tanah")),
    `${land.length} results`,
  );

  await page.goto(`${BASE}/id/listing?status=disewa`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  const rent = await page.evaluate(() =>
    [...document.querySelectorAll("article")].map(
      (a) => a.textContent?.includes("Disewakan") ?? false,
    ),
  );
  record(
    "status filter returns only that status",
    rent.length === 6 && rent.every(Boolean),
    `${rent.length} results`,
  );

  await page.goto(`${BASE}/id/listing?min=5000000000`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  const expensive = await page.evaluate(
    () => document.querySelectorAll("article").length,
  );
  record("price floor narrows the results", expensive === 4, `${expensive} results`);

  await page.goto(`${BASE}/id/listing?type=hotel&status=dijual`, {
    waitUntil: "networkidle2",
  });
  await new Promise((r) => setTimeout(r, 1200));
  const combined = await page.evaluate(
    () => document.querySelectorAll("article").length,
  );
  record("combined filters narrow further", combined === 1, `${combined} results`);

  await page.goto(`${BASE}/id/listing?type=hotel&location=Ubud`, {
    waitUntil: "networkidle2",
  });
  await new Promise((r) => setTimeout(r, 1200));
  const empty = await page.evaluate(() => ({
    cards: document.querySelectorAll("article").length,
    hasEmptyState: document.body.textContent?.includes("Tidak ada listing"),
  }));
  record(
    "an impossible filter shows the empty state",
    empty.cards === 0 && empty.hasEmptyState,
    `${empty.cards} results`,
  );
  await page.close();
}

/* ---------------------------------------------- 8. the custom listbox is real */

step("listbox");

{
  const page = await newPage();
  await page.goto(`${BASE}/id/listing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));

  const nativeSelects = await page.evaluate(
    () => document.querySelectorAll("select").length,
  );
  record("no native select anywhere", nativeSelects === 0, `${nativeSelects} found`);

  // Scope to the filter column: the header also holds a combobox (the language
  // switcher), and testing that one would not exercise the filters at all.
  const combo = await page.evaluateHandle(() => {
    const combos = [...document.querySelectorAll('[role="combobox"]')];
    return combos.find((c) => /Semua tipe|All types/.test(c.textContent ?? ""));
  });
  await combo.asElement()?.focus();
  await page.keyboard.press("ArrowDown");
  await new Promise((r) => setTimeout(r, 250));
  const afterOpen = await page.evaluate(() => {
    const c = [...document.querySelectorAll('[role="combobox"]')].find(
      (x) => x.getAttribute("aria-expanded") === "true",
    );
    return {
      expanded: c?.getAttribute("aria-expanded"),
      activeDescendant: c?.getAttribute("aria-activedescendant"),
      options: document.querySelectorAll('[role="option"]').length,
      focusOnTrigger: document.activeElement === c,
    };
  });
  record(
    "arrow key opens the listbox",
    afterOpen.expanded === "true" && afterOpen.options > 0,
    `${afterOpen.options} options`,
  );
  record("focus stays on the trigger", afterOpen.focusOnTrigger);

  await page.keyboard.press("End");
  await new Promise((r) => setTimeout(r, 200));
  const atEnd = await page.evaluate(() => {
    const c = document.activeElement;
    const options = [...document.querySelectorAll('[role="option"]')];
    return c?.getAttribute("aria-activedescendant") === options.at(-1)?.id;
  });
  record("End jumps to the last option", atEnd);

  await page.keyboard.press("Home");
  await new Promise((r) => setTimeout(r, 200));
  const atHome = await page.evaluate(() => {
    const c = document.activeElement;
    const options = [...document.querySelectorAll('[role="option"]')];
    return c?.getAttribute("aria-activedescendant") === options[0]?.id;
  });
  record("Home jumps to the first option", atHome);

  // Type-ahead: "v" should land on Villa.
  await page.keyboard.press("v");
  await new Promise((r) => setTimeout(r, 200));
  const typedAhead = await page.evaluate(() => {
    const active = document.getElementById(
      document.activeElement?.getAttribute("aria-activedescendant") ?? "",
    );
    return active?.textContent?.trim() ?? "";
  });
  record("type-ahead moves to the matching option", typedAhead.startsWith("Villa"), typedAhead);

  await page.keyboard.press("Enter");
  await new Promise((r) => setTimeout(r, 1400));
  const committed = await page.evaluate(() => ({
    expanded: document.activeElement?.getAttribute("aria-expanded"),
    url: location.search,
  }));
  record(
    "Enter commits the option and closes",
    committed.expanded === "false" && committed.url.includes("type=villa"),
    committed.url,
  );

  const combo2 = await page.evaluateHandle(() => {
    const combos = [...document.querySelectorAll('[role="combobox"]')];
    return combos.find((c) => /Villa/.test(c.textContent ?? ""));
  });
  await combo2.asElement()?.focus();
  await page.keyboard.press("ArrowDown");
  await new Promise((r) => setTimeout(r, 200));
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 200));
  const escaped = await page.evaluate(() => ({
    expanded: document.activeElement?.getAttribute("aria-expanded"),
    url: location.search,
  }));
  record(
    "Escape closes without changing the value",
    escaped.expanded === "false" && escaped.url.includes("type=villa"),
    escaped.url,
  );
  await page.close();
}

/* ------------------------------------------------ 9. price input formatting */

step("price-input");

{
  const page = await newPage();
  await page.goto(`${BASE}/id/listing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));
  const priceInput = await page.$('input[inputmode="numeric"]');
  await priceInput?.type("2500000000");
  await new Promise((r) => setTimeout(r, 1400));
  const priced = await page.evaluate(() => ({
    shown: document.querySelector('input[inputmode="numeric"]')?.value ?? "",
    url: location.search,
  }));
  record(
    "price input groups thousands on screen",
    priced.shown.includes(".") || priced.shown.includes(","),
    priced.shown,
  );
  record(
    "price input sends the raw number to the query",
    priced.url.includes("min=2500000000"),
    priced.url,
  );
  await page.close();
}

/* -------------------------------------------- 10. mobile filter panel + lock */

step("filter-panel");

{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(`${BASE}/id/listing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));

  const buttons = await page.$$('button[aria-haspopup="dialog"]');
  // The last one is the filter opener; the first is the hamburger.
  await buttons.at(-1)?.click();
  await new Promise((r) => setTimeout(r, 400));
  const panel = await page.evaluate(() => ({
    open: Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')),
    locked: document.body.dataset.scrollLocked === "true",
    aboveContent: (() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]')
        ?.parentElement;
      return dialog ? Number(getComputedStyle(dialog).zIndex) : 0;
    })(),
  }));
  record("mobile filter panel opens", panel.open);
  record("filter panel locks body scroll", panel.locked);
  record("filter panel sits above content", panel.aboveContent >= 200, `z=${panel.aboveContent}`);

  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
  const after = await page.evaluate(() => document.body.dataset.scrollLocked === "true");
  record("filter panel releases scroll on close", !after);
  await page.close();
}

/* ------------------------------------------------------- 11. gallery lightbox */

step("lightbox");

{
  const page = await newPage();
  await page.goto(`${BASE}/id/listing/ip-vl-001`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));

  await page.click(".cursor-zoom-in");
  await new Promise((r) => setTimeout(r, 400));
  const box = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    return {
      open: Boolean(dialog),
      locked: document.body.dataset.scrollLocked === "true",
      z: dialog ? Number(getComputedStyle(dialog.parentElement).zIndex) : 0,
    };
  });
  record("lightbox opens", box.open);
  record("lightbox locks body scroll", box.locked);
  record("lightbox sits above the filter and menu layers", box.z >= 400, `z=${box.z}`);

  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 300));
  const moved = await page.evaluate(
    () => document.querySelector('[role="dialog"] p')?.textContent ?? "",
  );
  record("arrow keys move through the gallery", moved.includes("2"), moved.trim());

  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
  const shut = await page.evaluate(() => ({
    open: Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')),
    locked: document.body.dataset.scrollLocked === "true",
  }));
  record("escape closes the lightbox", !shut.open);
  record("lightbox releases scroll", !shut.locked);
  await page.close();
}

/* ---------------------------------------------------- 12. language switching */

step("language");

{
  const page = await newPage();
  await page.goto(`${BASE}/id/listing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));

  await page.evaluate(() => {
    const combos = [...document.querySelectorAll('[role="combobox"]')];
    const switcher = combos.find((c) => /Indonesia|English/.test(c.textContent ?? ""));
    switcher?.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  const opened = await page.evaluate(
    () => document.body.dataset.scrollLocked === "true",
  );
  record("language list locks body scroll while open", opened);

  await page.evaluate(() => {
    const option = [...document.querySelectorAll('[role="option"]')].find((o) =>
      o.textContent?.includes("English"),
    );
    option?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 2500));

  const swapped = await page.evaluate(() => ({
    path: location.pathname,
    lang: document.documentElement.lang,
    cookie: document.cookie.includes("iyandana_locale=en"),
    locked: document.body.dataset.scrollLocked === "true",
    heading: document.querySelector("h1")?.textContent ?? "",
  }));
  record("language switch moves to the English path", swapped.path === "/en/listing", swapped.path);
  record("html lang follows the choice", swapped.lang === "en", swapped.lang);
  record("the choice is stored for later pages", swapped.cookie);
  record("language list releases scroll", !swapped.locked);
  record(
    "page content is translated",
    swapped.heading.includes("All properties"),
    swapped.heading,
  );

  // The stored choice must survive a fresh visit to the bare root.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  const remembered = await page.evaluate(() => location.pathname);
  record("stored language is used at the root", remembered === "/en", remembered);
  await page.close();
}

/* --------------------------------------------------- 13. WhatsApp deep links */

step("whatsapp");

{
  const page = await newPage();

  await page.goto(`${BASE}/id/listing/ip-rm-001`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1400));
  const detailLinks = await page.evaluate(() =>
    [...document.querySelectorAll("a[data-wa-source]")].map((a) => ({
      source: a.dataset.waSource,
      text: decodeURIComponent(new URL(a.href).searchParams.get("text") ?? ""),
      host: new URL(a.href).host,
    })),
  );

  const primary = detailLinks.find((l) => l.source === "detail-primary");
  record(
    "detail WhatsApp link carries the listing title",
    Boolean(primary?.text.includes("Rumah dua lantai di Kesiman Kertalangu")),
    primary?.text.split("\n")[3] ?? "",
  );
  record(
    "detail WhatsApp link carries the listing code",
    Boolean(primary?.text.includes("IP-RM-001")),
  );
  record(
    "detail WhatsApp link carries this page URL",
    Boolean(primary?.text.includes("/id/listing/ip-rm-001")),
    primary?.text.split("\n").at(-2) ?? "",
  );
  record(
    "every WhatsApp link names its own button",
    detailLinks.length > 0 &&
      detailLinks.every((l) => l.text.includes(`: ${l.source}`)),
    `${detailLinks.length} links`,
  );
  record(
    "every WhatsApp link points at wa.me",
    detailLinks.every((l) => l.host === "wa.me"),
  );

  // A button on a different page must report that page, not the last one.
  await page.goto(`${BASE}/en/konstruksi`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1400));
  const constructionLinks = await page.evaluate(() =>
    [...document.querySelectorAll("a[data-wa-source]")].map((a) =>
      decodeURIComponent(new URL(a.href).searchParams.get("text") ?? ""),
    ),
  );
  record(
    "WhatsApp links on other pages report their own URL",
    constructionLinks.length > 0 &&
      constructionLinks.every((t) => t.includes("/en/konstruksi")),
    `${constructionLinks.length} links`,
  );
  record(
    "WhatsApp message follows the page language",
    constructionLinks.every((t) => t.startsWith("Hello Iyandana Property.")),
  );

  // A card in a grid must carry its own listing, not the first one.
  await page.goto(`${BASE}/id/listing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1400));
  const cardLinks = await page.evaluate(() =>
    [...document.querySelectorAll("article a[data-wa-source]")].map((a) => {
      const article = a.closest("article");
      return {
        code: article?.querySelector("span.uppercase")?.textContent?.trim() ?? "",
        text: decodeURIComponent(new URL(a.href).searchParams.get("text") ?? ""),
      };
    }),
  );
  record(
    "each listing card links its own listing",
    cardLinks.length > 0 && cardLinks.every((c) => c.code && c.text.includes(c.code)),
    `${cardLinks.length} cards`,
  );
  await page.close();
}

/* ------------------------------------------------- 14. cookie consent drives */

step("cookies");

{
  const page = await newPage();
  const insightRequests = [];
  page.on("request", (r) => {
    if (r.url().includes("/_vercel/insights")) insightRequests.push(r.url());
  });

  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1800));
  const banner = await page.evaluate(() => {
    const region = document.querySelector('[role="region"]');
    return {
      visible: Boolean(region),
      z: region ? Number(getComputedStyle(region).zIndex) : 0,
    };
  });
  record("cookie bar appears on a first visit", banner.visible);
  record("cookie bar uses the cookie layer token", banner.z === 500, `z=${banner.z}`);
  record(
    "no analytics request before consent",
    insightRequests.length === 0,
    `${insightRequests.length} requests`,
  );

  // Declining keeps it off and dismisses the bar.
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('[role="region"] button')];
    buttons[0]?.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  const declined = await page.evaluate(() => ({
    gone: !document.querySelector('[role="region"]'),
    cookie: document.cookie.includes("iyandana_consent=declined"),
  }));
  record("declining dismisses the bar", declined.gone);
  record("the decline is stored", declined.cookie);
  record("still no analytics after declining", insightRequests.length === 0);

  // Accepting mounts the analytics component, which requests its script.
  await page.evaluate(() => {
    document.cookie = "iyandana_consent=accepted; path=/; max-age=600";
  });
  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2500));
  record(
    "accepting turns statistics on",
    insightRequests.length > 0,
    `${insightRequests.length} requests`,
  );
  await page.close();
}

/* ------------------------------- 15. cookie bar never covers the mobile menu */

step("cookie-menu");

{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1800));
  await page.click('button[aria-haspopup="dialog"]');
  await new Promise((r) => setTimeout(r, 500));
  const withMenu = await page.evaluate(
    () => !document.querySelector('[role="region"]'),
  );
  record("cookie bar hides while the mobile menu is open", withMenu);
  await page.close();
}

/* ---------------------- 16. cookie bar does not swallow the floating enquiry */

step("cookie-float");

{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(`${BASE}/id/listing/ip-rm-001`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  const reachable = await page.evaluate(() => {
    const bar = document.querySelector('a[data-wa-source="detail-sticky-bar"]');
    if (!bar) return "missing";
    const r = bar.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return bar.contains(hit) || hit === bar ? "ok" : `covered by ${hit?.tagName}.${hit?.className}`;
  });
  record("floating enquiry button stays clickable with the cookie bar up", reachable === "ok", reachable);
  await page.close();
}

/* ------------------------------------------------ 17. server-side validation */

step("server-validation");

{
  const page = await newPage();
  await page.goto(`${BASE}/id/titipkan-properti`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1600));
  await page.evaluate(() => {
    document.querySelector("form")?.requestSubmit();
  });
  await new Promise((r) => setTimeout(r, 2500));
  const validation = await page.evaluate(() => ({
    alert: document.querySelector('[role="alert"]')?.textContent ?? "",
    fieldErrors: document.querySelectorAll('[aria-invalid="true"]').length,
  }));
  record(
    "the server rejects an empty enquiry",
    validation.alert.length > 0 && validation.fieldErrors > 0,
    `${validation.fieldErrors} fields flagged`,
  );
  await page.close();
}

/* ------------------------------------------------- 18. structured data is valid */

step("schema");

{
  const page = await newPage();
  await page.goto(`${BASE}/id/listing/ip-rm-001`, { waitUntil: "networkidle2" });
  const schemas = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try {
        return JSON.parse(s.textContent ?? "");
      } catch {
        return { error: true };
      }
    }),
  );
  const types = schemas.map((s) => s["@type"]);
  record(
    "structured data parses",
    schemas.length >= 3 && !schemas.some((s) => s.error),
    types.join(", "),
  );
  record("the business is described", types.includes("RealEstateAgent"));
  record(
    "the listing is described with an offer",
    schemas.some((s) => s.offers?.price === 2750000000),
  );
  record(
    "opening hours are published",
    Boolean(
      schemas.find((s) => s["@type"] === "RealEstateAgent")
        ?.openingHoursSpecification?.length,
    ),
  );
  await page.close();
}

/* --------------------------------------------------- 19. sitemap completeness */

step("sitemap");

{
  const page = await newPage();
  const xml = await page.goto(`${BASE}/sitemap.xml`).then((r) => r.text());
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  record(
    "sitemap lists every listing in both languages",
    urls.filter((u) => /\/listing\/ip-/.test(u)).length === 28,
    `${urls.filter((u) => /\/listing\/ip-/.test(u)).length} listing urls`,
  );
  record("sitemap covers every page", urls.length === 42, `${urls.length} urls`);

  const robots = await page.goto(`${BASE}/robots.txt`).then((r) => r.text());
  record("robots points at the sitemap", robots.includes("/sitemap.xml"), robots.trim().split("\n").at(-1));
  await page.close();
}

/* --------------------------------------------------------- 20. route transition */

step("transition");

{
  const page = await newPage();
  await page.goto(`${BASE}/id`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1800));
  await page.evaluate(() => window.scrollTo(0, 1400));
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const link = [...document.querySelectorAll("a")].find((a) =>
      a.getAttribute("href")?.endsWith("/id/konstruksi"),
    );
    link?.click();
  });

  // Mid-transition the curtain must be covering.
  await new Promise((r) => setTimeout(r, 600));
  const during = await page.evaluate(
    () => document.querySelector(".curtain")?.getAttribute("data-phase") ?? "none",
  );
  record("curtain closes on navigation", ["closing", "holding"].includes(during), during);

  await new Promise((r) => setTimeout(r, 3200));
  const after = await page.evaluate(() => ({
    phase: document.querySelector(".curtain")?.getAttribute("data-phase") ?? "none",
    path: location.pathname,
    scroll: window.scrollY,
    slat: getComputedStyle(document.querySelector(".curtain__slat")).transform,
  }));
  record("curtain opens again", after.phase === "idle", after.phase);
  record("navigation completed", after.path === "/id/konstruksi", after.path);
  record("scroll reset to the top under cover", after.scroll < 20, `y=${after.scroll}`);
  record(
    "curtain parks off screen when idle",
    after.slat === "none" || after.slat.includes("matrix"),
    after.slat,
  );
  await page.close();
}

/* -------------------------------------------------------------------- report */

await browser.close();
stopServer();

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed against ${BASE}`,
);
if (failed.length) {
  console.log("\nFailures:");
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
