import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCALES, COMPANY } from "@/lib/site";

export const alt = "Iyandana Property";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * The share card: the wordmark in the site's own typeface on the site's own
 * ground, with the same drafting hairlines the property artwork uses. No stock
 * photography, and no claim about the business.
 *
 * This runs during `next build`, so the font files are read from the repo on
 * the build machine and the result ships as a static PNG.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [medium, regular] = await Promise.all([
    readFile(path.join(process.cwd(), "src/assets/NeueMontreal-Medium.ttf")),
    readFile(path.join(process.cwd(), "src/assets/NeueMontreal-Regular.ttf")),
  ]);

  const tagline =
    locale === "en"
      ? "Property and construction in Bali"
      : "Properti dan konstruksi di Bali";

  // Satori needs every element with more than one child to declare a display
  // mode, so each text block below is composed into a single string first.
  const place = `${COMPANY.city.toUpperCase()}, ${COMPANY.region.toUpperCase()}`;
  const office = `${COMPANY.village}, ${COMPANY.district}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f4f2ec",
          color: "#14201b",
          padding: "72px 80px",
          fontFamily: "Neue Montreal",
          position: "relative",
        }}
      >
        {/* The same hairline grid as the property tiles. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(20,32,27,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,32,27,0.055) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 2, backgroundColor: "#1b5e4c" }} />
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 4,
              color: "#1b5e4c",
              fontWeight: 500,
            }}
          >
            {place}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
            <div
              style={{
                display: "flex",
                fontSize: 118,
                fontWeight: 500,
                letterSpacing: -3,
              }}
            >
              IYANDANA
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 60,
                letterSpacing: 14,
                color: "#4c5a54",
              }}
            >
              PROPERTY
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#4c5a54" }}>
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#5e6b65",
          }}
        >
          <div style={{ display: "flex" }}>{COMPANY.legalName}</div>
          <div style={{ display: "flex" }}>{office}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Neue Montreal", data: medium, weight: 500, style: "normal" },
        { name: "Neue Montreal", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
