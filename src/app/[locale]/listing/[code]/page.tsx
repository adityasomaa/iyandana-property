import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "@phosphor-icons/react/dist/ssr";

import { isLocale, SITE_URL, COMPANY, type Locale } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { path, listingPath } from "@/lib/routes";
import { getListing, relatedListings, LISTINGS, SAMPLE_DATA } from "@/lib/listings";
import { formatArea, priceLine } from "@/lib/format";
import { LOCALES } from "@/lib/site";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { Reveal } from "@/components/ui/Reveal";
import { Gallery } from "@/components/listing/Gallery";
import { ListingCard } from "@/components/listing/ListingCard";
import { StatusChip, SampleChip } from "@/components/listing/StatusChip";
import { ListingSchema, BreadcrumbSchema } from "@/components/seo/Schema";

type Props = { params: Promise<{ locale: string; code: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    LISTINGS.map((listing) => ({ locale, code: listing.code.toLowerCase() })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, code } = await params;
  if (!isLocale(locale)) return {};
  const listing = getListing(code);
  if (!listing) return { title: getDictionary(locale).detail.notFound };

  const title = listing.title[locale];
  return {
    title,
    description: listing.description[locale],
    alternates: {
      canonical: `${SITE_URL}${listingPath(locale, listing.code)}`,
      languages: {
        id: `${SITE_URL}${listingPath("id", listing.code)}`,
        en: `${SITE_URL}${listingPath("en", listing.code)}`,
      },
    },
    openGraph: {
      title,
      description: listing.description[locale],
      url: `${SITE_URL}${listingPath(locale, listing.code)}`,
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { locale, code } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  const listing = getListing(code);
  if (!listing) notFound();

  const title = listing.title[typed];
  const context = { title, code: listing.code };
  const related = relatedListings(listing, 3);

  const specs: ({ label: string; value: string } | null)[] = [
    listing.bedrooms
      ? { label: dict.specs.bedrooms, value: String(listing.bedrooms) }
      : null,
    listing.bathrooms
      ? { label: dict.specs.bathrooms, value: String(listing.bathrooms) }
      : null,
    listing.landArea
      ? { label: dict.specs.landArea, value: formatArea(listing.landArea, dict, typed) }
      : null,
    listing.buildingArea
      ? {
          label: dict.specs.buildingArea,
          value: formatArea(listing.buildingArea, dict, typed),
        }
      : null,
    listing.certificate
      ? { label: dict.specs.certificate, value: listing.certificate }
      : null,
    { label: dict.types.label, value: dict.types[listing.type] },
  ];
  const shownSpecs = specs.filter(
    (x): x is { label: string; value: string } => x !== null,
  );

  const mapQuery = encodeURIComponent(
    `${listing.area}, ${listing.regency}, ${COMPANY.region}, Indonesia`,
  );

  return (
    <>
      <div className="mx-auto max-w-[84rem] px-5 pb-24 pt-[calc(var(--header-h)+2rem)] sm:px-8">
        <Link
          href={path(typed, "listing")}
          className="inline-flex items-center gap-2 text-[0.8125rem] text-ink-soft transition-colors duration-200 hover:text-jade"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden />
          {dict.common.backToListing}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <Gallery
              code={listing.code}
              views={listing.views}
              typeLabel={dict.types[listing.type]}
              dict={dict}
            />
          </div>

          <div>
            <p className="rule-label flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-px w-8 shrink-0 bg-jade opacity-60"
              />
              {dict.detail.sectionTitle}
            </p>

            <h1 className="mt-5 text-[clamp(1.6rem,1.2rem+1.9vw,2.5rem)] leading-[1.08] [overflow-wrap:anywhere]">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusChip status={listing.status} dict={dict} size="md" />
              {SAMPLE_DATA ? <SampleChip label={dict.common.sampleBadge} /> : null}
              <span className="inline-flex items-center rounded-[2px] border border-hair px-2.5 py-1.5 text-xs text-ink-soft">
                {dict.common.code}: {listing.code}
              </span>
            </div>

            <p className="mt-6 flex items-center gap-2 text-[0.875rem] text-ink-soft">
              <MapPin size={15} weight="bold" aria-hidden className="shrink-0" />
              {listing.area}, {listing.regency}
            </p>

            <p className="mt-6 border-t border-hair pt-6">
              <span className="block text-[0.75rem] uppercase tracking-[0.14em] text-ink-faint">
                {dict.specs.price}
              </span>
              <span className="mt-2 block text-[clamp(1.35rem,1.1rem+1vw,1.85rem)] font-medium tracking-tight text-jade [font-variant-numeric:tabular-nums]">
                {priceLine(listing, dict, typed)}
              </span>
            </p>

            {SAMPLE_DATA ? (
              <p className="mt-6 border-l-[3px] border-jade bg-surface py-3 pl-4 pr-4 text-[0.8125rem] leading-relaxed text-ink-soft">
                {dict.common.sampleNoticeListing}
              </p>
            ) : null}

            <div className="mt-8 hidden lg:block">
              <WhatsAppLink
                source="detail-primary"
                context={context}
                className="w-full"
              >
                {dict.common.whatsapp}
              </WhatsAppLink>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ specification */}
        <section className="mt-20 border-t border-hair pt-12">
          <h2 className="rule-label">{dict.detail.specsHeading}</h2>
          <dl className="mt-6 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {shownSpecs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-6 border-b border-hair py-4"
              >
                <dt className="text-[0.8125rem] text-ink-soft">{spec.label}</dt>
                <dd className="text-right text-[0.9375rem] [font-variant-numeric:tabular-nums]">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ------------------------------------------------------- description */}
        <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="rule-label">{dict.detail.descriptionHeading}</h2>
            <p className="mt-6 max-w-[64ch] text-[0.9375rem] leading-relaxed text-ink-soft">
              {listing.description[typed]}
            </p>
          </div>

          <div>
            <h2 className="rule-label">{dict.detail.locationHeading}</h2>
            <p className="mt-6 text-[0.9375rem] text-ink-soft">
              {listing.area}, {listing.regency}, {COMPANY.region}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-[0.8125rem] text-jade underline underline-offset-4"
            >
              {dict.contact.details.cta}
            </a>
          </div>
        </section>

        {/* ---------------------------------------------------------- enquiry */}
        <section className="mt-20 border border-hair bg-surface p-8 sm:p-12">
          <SectionHeader
            sectionTitle={dict.detail.sectionTitle}
            headline={dict.detail.askHeading}
            body={dict.detail.askBody}
            cta={
              <WhatsAppLink source="detail-enquiry-block" context={context}>
                {dict.common.whatsapp}
              </WhatsAppLink>
            }
          />
        </section>

        {/* ---------------------------------------------------------- related */}
        {related.length ? (
          <section className="mt-24">
            <SectionHeader
              sectionTitle={dict.listingPage.sectionTitle}
              headline={dict.detail.similarHeading}
              body={dict.detail.similarBody}
              cta={
                <Link
                  href={path(typed, "listing")}
                  className="text-[0.8125rem] text-jade underline underline-offset-4"
                >
                  {dict.common.viewAll}
                </Link>
              }
            />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal as="li" key={item.code} delay={i * 80}>
                  <ListingCard
                    listing={item}
                    dict={dict}
                    locale={typed}
                    isSample={SAMPLE_DATA}
                    source="detail-related"
                  />
                </Reveal>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {/* Floating enquiry bar for small screens. It sits above the cookie bar
          rather than under it, using the height the bar publishes. */}
      <div
        className="fixed inset-x-0 z-[var(--z-raised)] border-t border-hair bg-paper/95 p-3 backdrop-blur-lg lg:hidden"
        style={{ bottom: "var(--cookie-h, 0px)" }}
      >
        <WhatsAppLink
          source="detail-sticky-bar"
          context={context}
          className="w-full"
        >
          {dict.common.whatsapp}
        </WhatsAppLink>
      </div>
      <div aria-hidden className="h-[4.75rem] lg:hidden" />

      <ListingSchema listing={listing} locale={typed} />
      <BreadcrumbSchema
        items={[
          { name: dict.nav.home, url: `${SITE_URL}${path(typed, "home")}` },
          { name: dict.nav.listing, url: `${SITE_URL}${path(typed, "listing")}` },
          { name: title, url: `${SITE_URL}${listingPath(typed, listing.code)}` },
        ]}
      />
    </>
  );
}
