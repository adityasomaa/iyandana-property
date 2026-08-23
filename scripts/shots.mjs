/**
 * Screenshot sweep for eyeballing a deployment.
 *   node scripts/shots.mjs <baseUrl> <outDir>
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = (process.argv[2] ?? "https://iyandanaproperty.vercel.app").replace(/\/$/, "");
const OUT = process.argv[3] ?? "shots";
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Users/User/AppData/Local/Google/Chrome/Application/chrome.exe";

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

const SHOTS = [
  { name: "home-hero", url: "/id", w: 1440, h: 900, full: false },
  { name: "home-full", url: "/id", w: 1440, h: 900, full: true },
  { name: "listing", url: "/id/listing", w: 1440, h: 900, full: true },
  { name: "detail", url: "/id/listing/ip-vl-003", w: 1440, h: 900, full: true },
  { name: "construction", url: "/id/konstruksi", w: 1440, h: 900, full: true },
  { name: "consign", url: "/id/titipkan-properti", w: 1440, h: 900, full: true },
  { name: "contact", url: "/id/kontak", w: 1440, h: 900, full: true },
  { name: "privacy", url: "/id/privacy", w: 1440, h: 900, full: true },
  { name: "en-home", url: "/en", w: 1440, h: 900, full: false },
  { name: "m-home", url: "/id", w: 375, h: 812, full: false, mobile: true },
  { name: "m-listing", url: "/id/listing", w: 375, h: 812, full: true, mobile: true },
  { name: "m-detail", url: "/id/listing/ip-rm-001", w: 375, h: 812, full: true, mobile: true },
  { name: "t-listing", url: "/id/listing", w: 768, h: 1024, full: true, mobile: true },
];

for (const shot of SHOTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: shot.w,
    height: shot.h,
    isMobile: Boolean(shot.mobile),
    hasTouch: Boolean(shot.mobile),
    deviceScaleFactor: 1,
  });
  await page.goto(`${BASE}${shot.url}`, { waitUntil: "networkidle2", timeout: 60000 });
  // Past the intro, past the reveals, and with the cookie bar dismissed so the
  // page itself is what gets looked at.
  await page.evaluate(() => {
    document.cookie = "iyandana_consent=declined; path=/; max-age=600";
  });
  await page.reload({ waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2200));
  if (shot.full) {
    await page.evaluate(async () => {
      const step = innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 260));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 800));
  }
  await page.screenshot({
    path: path.join(OUT, `${shot.name}.png`),
    fullPage: Boolean(shot.full),
  });
  console.log(shot.name);
  await page.close();
}

await browser.close();
