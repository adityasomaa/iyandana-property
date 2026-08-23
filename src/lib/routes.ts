import type { Locale } from "./site";
import type { Dict } from "./dictionary";

/** Route slugs are identical in both languages; only the locale prefix moves. */
export const ROUTES = {
  home: "",
  listing: "listing",
  construction: "konstruksi",
  consign: "titipkan-properti",
  contact: "kontak",
  privacy: "privacy",
  terms: "terms",
} as const;

export type RouteKey = keyof typeof ROUTES;

export function path(locale: Locale, key: RouteKey, sub?: string): string {
  const base = ROUTES[key];
  const parts = [locale, base, sub].filter(Boolean);
  return `/${parts.join("/")}`;
}

export function listingPath(locale: Locale, code: string): string {
  return path(locale, "listing", code.toLowerCase());
}

/** The five items in the main navigation, in order. */
export const NAV_KEYS = [
  "home",
  "listing",
  "construction",
  "consign",
  "contact",
] as const;

export function navLabel(dict: Dict, key: (typeof NAV_KEYS)[number]): string {
  return dict.nav[key];
}

/** Swaps the locale segment of a path, keeping everything after it. */
export function swapLocale(pathname: string, next: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${next}`;
  segments[0] = next;
  return `/${segments.join("/")}`;
}
