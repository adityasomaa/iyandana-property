import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, SITE_URL, type Locale } from "@/lib/site";
import { getDictionary, fill } from "@/lib/dictionary";
import { path } from "@/lib/routes";
import {
  allLocations,
  filterListings,
  queryFromParams,
  SAMPLE_DATA,
} from "@/lib/listings";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { Reveal } from "@/components/ui/Reveal";
import { ListingCard } from "@/components/listing/ListingCard";
import { FilterPanel } from "@/components/listing/FilterPanel";
import {
  BreadcrumbSchema,
  ListingCollectionSchema,
} from "@/components/seo/Schema";

type Params = { params: Promise<{ locale: string }> };
type Search = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.listingPage.title,
    description: dict.listingPage.body,
    alternates: {
      canonical: `${SITE_URL}${path(locale, "listing")}`,
      languages: {
        id: `${SITE_URL}${path("id", "listing")}`,
        en: `${SITE_URL}${path("en", "listing")}`,
      },
    },
  };
}

export default async function ListingIndexPage({
  params,
  searchParams,
}: Params & Search) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const query = queryFromParams(await searchParams);
  const results = filterListings(query, typed);
  const locations = allLocations();

  const count =
    results.length === 0
      ? dict.search.resultsNone
      : results.length === 1
        ? dict.search.resultsOne
        : fill(dict.search.resultsMany, { n: results.length });

  return (
    <>
      <div className="mx-auto max-w-[84rem] px-5 pb-24 pt-[calc(var(--header-h)+3rem)] sm:px-8">
        <SectionHeader
          as="h1"
          sectionTitle={dict.listingPage.sectionTitle}
          headline={dict.listingPage.headline}
          body={dict.listingPage.body}
          cta={
            <WhatsAppLink source="listing-index-header" variant="outline">
              {dict.listingPage.cta}
            </WhatsAppLink>
          }
        />

        {SAMPLE_DATA ? (
          <p className="mt-8 border-l-[3px] border-jade bg-surface py-3 pl-4 pr-4 text-[0.8125rem] leading-relaxed text-ink-soft">
            {dict.common.sampleNoticeShort}
          </p>
        ) : null}

        <div className="mt-12 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          <FilterPanel
            dict={dict}
            locale={typed}
            locations={locations}
            initial={query}
            resultCount={results.length}
          />

          <div>
            <p
              aria-live="polite"
              className="text-[0.8125rem] text-ink-soft [font-variant-numeric:tabular-nums]"
            >
              {count}
            </p>

            {results.length ? (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((listing, i) => (
                  <Reveal as="li" key={listing.code} delay={(i % 3) * 80}>
                    <ListingCard
                      listing={listing}
                      dict={dict}
                      locale={typed}
                      isSample={SAMPLE_DATA}
                      source="listing-index-card"
                      priority={i < 3}
                    />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="mt-6 border border-dashed border-control bg-surface p-10 text-center">
                <p className="text-base">{dict.search.resultsNone}</p>
                <p className="mx-auto mt-3 max-w-[46ch] text-[0.875rem] leading-relaxed text-ink-soft">
                  {dict.search.emptyBody}
                </p>
                <div className="mt-6 flex justify-center">
                  <WhatsAppLink source="listing-index-empty">
                    {dict.common.whatsapp}
                  </WhatsAppLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ListingCollectionSchema listings={results} locale={typed} />
      <BreadcrumbSchema
        items={[
          { name: dict.nav.home, url: `${SITE_URL}${path(typed, "home")}` },
          { name: dict.nav.listing, url: `${SITE_URL}${path(typed, "listing")}` },
        ]}
      />
    </>
  );
}
