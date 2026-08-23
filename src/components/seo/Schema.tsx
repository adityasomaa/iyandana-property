import { COMPANY, OPENING_HOURS, SITE_URL, type Locale } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { listingPath } from "@/lib/routes";
import type { Listing } from "@/data/types";

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own constants, never from user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: `${COMPANY.street}, ${COMPANY.village}`,
  addressLocality: COMPANY.district,
  addressRegion: COMPANY.region,
  postalCode: COMPANY.postalCode,
  addressCountry: COMPANY.country,
};

/** The business itself, emitted once per page from the locale layout. */
export function OrganizationSchema({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "@id": `${SITE_URL}/#organization`,
        name: COMPANY.name,
        legalName: COMPANY.legalName,
        url: `${SITE_URL}/${locale}`,
        image: `${SITE_URL}/brand/mark-512.png`,
        logo: `${SITE_URL}/brand/mark-512.png`,
        email: COMPANY.email,
        telephone: COMPANY.phones[0],
        address: POSTAL_ADDRESS,
        geo: {
          "@type": "GeoCoordinates",
          latitude: COMPANY.geo.lat,
          longitude: COMPANY.geo.lng,
        },
        areaServed: { "@type": "AdministrativeArea", name: "Bali, Indonesia" },
        description: dict.home.heroLede,
        knowsLanguage: ["id", "en"],
        openingHoursSpecification: OPENING_HOURS.map((slot) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: slot.days,
          opens: slot.opens,
          closes: slot.closes,
        })),
      }}
    />
  );
}

/** One listing, on its detail page. */
export function ListingSchema({
  listing,
  locale,
}: {
  listing: Listing;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const url = `${SITE_URL}${listingPath(locale, listing.code)}`;

  const specs = [
    listing.landArea
      ? { "@type": "QuantitativeValue", name: dict.specs.landArea, value: listing.landArea, unitCode: "MTK" }
      : null,
    listing.buildingArea
      ? { "@type": "QuantitativeValue", name: dict.specs.buildingArea, value: listing.buildingArea, unitCode: "MTK" }
      : null,
  ].filter(Boolean);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": listing.status === "dijual" ? "SingleFamilyResidence" : "Accommodation",
        "@id": `${url}#listing`,
        name: listing.title[locale],
        description: listing.description[locale],
        url,
        identifier: listing.code,
        image: Array.from(
          { length: listing.views },
          (_, i) => `${SITE_URL}/tiles/${listing.code}-${i}.svg`,
        ),
        address: {
          "@type": "PostalAddress",
          addressLocality: listing.area,
          addressRegion: `${listing.regency}, ${COMPANY.region}`,
          addressCountry: COMPANY.country,
        },
        ...(listing.bedrooms ? { numberOfBedrooms: listing.bedrooms } : {}),
        ...(listing.bathrooms ? { numberOfBathroomsTotal: listing.bathrooms } : {}),
        ...(listing.landArea
          ? {
              floorSize: {
                "@type": "QuantitativeValue",
                value: listing.buildingArea ?? listing.landArea,
                unitCode: "MTK",
              },
            }
          : {}),
        ...(specs.length ? { additionalProperty: specs } : {}),
        offers: {
          "@type": "Offer",
          price: listing.price,
          priceCurrency: "IDR",
          url,
          availability: "https://schema.org/InStock",
          businessFunction:
            listing.status === "dijual"
              ? "http://purl.org/goodrelations/v1#Sell"
              : "http://purl.org/goodrelations/v1#LeaseOut",
          seller: { "@id": `${SITE_URL}/#organization` },
        },
      }}
    />
  );
}

/** The listing index, as an ordered list of the results being shown. */
export function ListingCollectionSchema({
  listings,
  locale,
}: {
  listings: Listing[];
  locale: Locale;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        numberOfItems: listings.length,
        itemListElement: listings.map((listing, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: listing.title[locale],
          url: `${SITE_URL}${listingPath(locale, listing.code)}`,
        })),
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
