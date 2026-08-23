/**
 * Single source of truth for company facts and deployment URLs.
 *
 * Everything here was taken from the client's own live site. Nothing is
 * invented. If a fact is not listed here it is because we do not have it, and
 * no page may claim it.
 */

/**
 * The one place the canonical origin is written. Metadata, canonical links,
 * hreflang alternates, the sitemap, robots.txt, the structured data and every
 * WhatsApp message all read this.
 *
 * `iyandana-property.vercel.app` was already held by another Vercel account
 * (409 on claim), so the project took the nearest free name, which also happens
 * to match the client's own domain.
 */
export const SITE_URL = "https://iyandanaproperty.vercel.app";

export const COMPANY = {
  legalName: "PT Iyan Dana Group",
  name: "Iyandana Property",
  street: "Jl. Gatot Subroto Timur No. 900D Kapling 8",
  village: "Kesiman Kertalangu",
  district: "Denpasar Timur",
  city: "Denpasar",
  region: "Bali",
  postalCode: "80237",
  country: "ID",
  countryName: "Indonesia",
  email: "iyandanagroup@gmail.com",
  /** Digits only, international format, for wa.me links. */
  whatsapp: "6287779999199",
  /** Display forms of the two published numbers. */
  phones: ["+62 877-7999-9199", "+62 823-4000-1499"],
  geo: { lat: -8.6462, lng: 115.2494 },
} as const;

export const FULL_ADDRESS = `${COMPANY.street}, ${COMPANY.village}, ${COMPANY.district}, ${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}`;

/** Opening hours exactly as published on the client's current contact page. */
export const OPENING_HOURS = [
  { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
  { days: ["Saturday"], opens: "08:00", closes: "15:00" },
] as const;

export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
