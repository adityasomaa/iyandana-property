import type { MetadataRoute } from "next";
import { LOCALES, SITE_URL } from "@/lib/site";
import { ROUTES, path, listingPath, type RouteKey } from "@/lib/routes";
import { LISTINGS } from "@/lib/listings";

/**
 * Every page, in every language, with the alternates that pair them.
 * Listing detail pages are included one per listing per language.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const alternates = (build: (locale: (typeof LOCALES)[number]) => string) => ({
    languages: Object.fromEntries(
      LOCALES.map((locale) => [locale, `${SITE_URL}${build(locale)}`]),
    ),
  });

  const priorities: Record<RouteKey, number> = {
    home: 1,
    listing: 0.9,
    construction: 0.8,
    consign: 0.7,
    contact: 0.7,
    privacy: 0.3,
    terms: 0.3,
  };

  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}${path(locale, key)}`,
        changeFrequency: key === "listing" || key === "home" ? "weekly" : "yearly",
        priority: priorities[key],
        alternates: alternates((l) => path(l, key)),
      });
    }
  }

  for (const listing of LISTINGS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}${listingPath(locale, listing.code)}`,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates((l) => listingPath(l, listing.code)),
      });
    }
  }

  return entries;
}
