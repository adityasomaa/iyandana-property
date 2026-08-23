import type { Locale } from "./site";
import type { Dict } from "./dictionary";
import type { Listing } from "@/data/types";

/** Rupiah, no decimals, grouped. Same digits in both locales. */
export function formatPrice(value: number, locale: Locale): string {
  const nf = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 0,
  });
  return `Rp ${nf.format(value)}`;
}

/** Digit grouping only, used by the price-range inputs. */
export function groupDigits(value: string, locale: Locale): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const nf = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US");
  return nf.format(Number(digits));
}

/** Strips grouping back to the raw number the maths runs on. */
export function ungroupDigits(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

export function formatArea(value: number, dict: Dict, locale: Locale): string {
  const nf = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US");
  return `${nf.format(value)} ${dict.specs.sqm}`;
}

/**
 * The full price line, including the period for rentals. The period is written
 * out rather than implied so a rental price can never be mistaken for a sale.
 */
export function priceLine(listing: Listing, dict: Dict, locale: Locale): string {
  const price = formatPrice(listing.price, locale);
  if (listing.status !== "disewa" || !listing.pricePeriod) return price;
  const period =
    listing.pricePeriod === "tahun" ? dict.specs.perYear : dict.specs.perMonth;
  return `${price} ${period}`;
}

export function listingTitle(listing: Listing, locale: Locale): string {
  return listing.title[locale];
}

export function listingDescription(listing: Listing, locale: Locale): string {
  return listing.description[locale];
}

export function tilePath(code: string, view: number): string {
  return `/tiles/${code}-${view}.svg`;
}
