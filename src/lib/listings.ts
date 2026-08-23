import { LISTINGS, SAMPLE_DATA } from "@/data/listings";
import type { Listing, PropertyType, ListingStatus } from "@/data/types";
import type { Locale } from "./site";

export { LISTINGS, SAMPLE_DATA };

export type SortKey = "default" | "price-asc" | "price-desc";

export type Query = {
  q?: string;
  type?: PropertyType | "";
  status?: ListingStatus | "";
  location?: string;
  min?: number | null;
  max?: number | null;
  sort?: SortKey;
};

/** Every distinct area, alphabetical, for the location filter. */
export function allLocations(): string[] {
  return [...new Set(LISTINGS.map((l) => l.area))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getListing(code: string): Listing | undefined {
  const wanted = code.toUpperCase();
  return LISTINGS.find((l) => l.code.toUpperCase() === wanted);
}

function matchesKeyword(listing: Listing, q: string, locale: Locale): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    listing.code,
    listing.area,
    listing.regency,
    listing.title[locale],
    listing.title[locale === "id" ? "en" : "id"],
    listing.description[locale],
  ]
    .join(" ")
    .toLowerCase();
  // Every word must appear somewhere, so extra words narrow rather than widen.
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function filterListings(query: Query, locale: Locale): Listing[] {
  const { q = "", type = "", status = "", location = "", min, max } = query;

  const result = LISTINGS.filter((listing) => {
    if (type && listing.type !== type) return false;
    if (status && listing.status !== status) return false;
    if (location && listing.area !== location) return false;
    if (min != null && listing.price < min) return false;
    if (max != null && listing.price > max) return false;
    if (!matchesKeyword(listing, q, locale)) return false;
    return true;
  });

  if (query.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (query.sort === "price-desc") result.sort((a, b) => b.price - a.price);

  return result;
}

/** Other listings sharing a type or status, for the bottom of a detail page. */
export function relatedListings(listing: Listing, limit = 3): Listing[] {
  const others = LISTINGS.filter((l) => l.code !== listing.code);
  const sameType = others.filter((l) => l.type === listing.type);
  const sameStatus = others.filter(
    (l) => l.type !== listing.type && l.status === listing.status,
  );
  return [...sameType, ...sameStatus, ...others].slice(0, limit);
}

export function latestListings(limit = 6): Listing[] {
  return LISTINGS.slice(0, limit);
}

/** Parses the query out of URL search params, tolerating anything unexpected. */
export function queryFromParams(
  params: Record<string, string | string[] | undefined>,
): Query {
  const one = (key: string): string => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const num = (key: string): number | null => {
    const raw = one(key).replace(/\D/g, "");
    return raw ? Number(raw) : null;
  };
  const type = one("type");
  const status = one("status");
  const sort = one("sort");

  return {
    q: one("q"),
    type: (["rumah", "villa", "tanah", "hotel", "komersial"].includes(type)
      ? type
      : "") as PropertyType | "",
    status: (["dijual", "disewa"].includes(status)
      ? status
      : "") as ListingStatus | "",
    location: allLocations().includes(one("location")) ? one("location") : "",
    min: num("min"),
    max: num("max"),
    sort: (["price-asc", "price-desc"].includes(sort)
      ? sort
      : "default") as SortKey,
  };
}

export function queryToSearchParams(query: Query): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.type) params.set("type", query.type);
  if (query.status) params.set("status", query.status);
  if (query.location) params.set("location", query.location);
  if (query.min != null) params.set("min", String(query.min));
  if (query.max != null) params.set("max", String(query.max));
  if (query.sort && query.sort !== "default") params.set("sort", query.sort);
  return params;
}

export function isQueryEmpty(query: Query): boolean {
  return (
    !query.q &&
    !query.type &&
    !query.status &&
    !query.location &&
    query.min == null &&
    query.max == null &&
    (!query.sort || query.sort === "default")
  );
}
