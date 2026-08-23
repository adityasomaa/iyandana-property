import Link from "next/link";
import { Bed, Bathtub, Ruler, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { Listing } from "@/data/types";
import { fill, type Dict } from "@/lib/dictionary";
import type { Locale } from "@/lib/site";
import { listingPath } from "@/lib/routes";
import { formatArea, priceLine, tilePath } from "@/lib/format";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { StatusChip, SampleChip } from "./StatusChip";

export function ListingCard({
  listing,
  dict,
  locale,
  isSample,
  source,
  priority = false,
}: {
  listing: Listing;
  dict: Dict;
  locale: Locale;
  isSample: boolean;
  /** Distinguishes which grid the WhatsApp button was pressed in. */
  source: string;
  priority?: boolean;
}) {
  const title = listing.title[locale];
  const href = listingPath(locale, listing.code);

  const facts = [
    listing.bedrooms
      ? { icon: Bed, label: dict.specs.bedrooms, value: String(listing.bedrooms) }
      : null,
    listing.bathrooms
      ? {
          icon: Bathtub,
          label: dict.specs.bathrooms,
          value: String(listing.bathrooms),
        }
      : null,
    listing.landArea
      ? {
          icon: Ruler,
          label: dict.specs.landArea,
          value: formatArea(listing.landArea, dict, locale),
        }
      : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <article className="group relative flex flex-col border border-hair bg-surface transition-colors duration-300 ease-[var(--ease-out-expo)] focus-within:border-jade hover:border-control">
      <div className="relative overflow-hidden bg-sunk">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tilePath(listing.code, 0)}
          alt={fill(dict.detail.artworkAlt, {
            type: dict.types[listing.type].toLowerCase(),
            n: 1,
          })}
          width={1600}
          height={1200}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <StatusChip status={listing.status} dict={dict} />
          {isSample ? <SampleChip label={dict.common.sampleBadge} /> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="flex items-center gap-1.5 text-[0.75rem] text-ink-faint">
            <MapPin size={13} weight="bold" aria-hidden className="shrink-0" />
            <span className="truncate">
              {listing.area}, {listing.regency}
            </span>
            <span aria-hidden className="opacity-40">
              ·
            </span>
            <span className="shrink-0">{dict.types[listing.type]}</span>
          </p>

          <h3 className="mt-2 text-[1.0625rem] leading-snug [overflow-wrap:anywhere]">
            <Link
              href={href}
              className="line-clamp-2 after:absolute after:inset-0 after:content-['']"
            >
              {title}
            </Link>
          </h3>
        </div>

        <p className="mt-auto">
          <span className="sr-only">{dict.specs.price}: </span>
          <span className="text-[1.0625rem] font-medium tracking-tight text-jade [font-variant-numeric:tabular-nums]">
            {priceLine(listing, dict, locale)}
          </span>
        </p>

        {facts.length ? (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hair pt-4 text-[0.75rem] text-ink-soft">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-center gap-1.5">
                <fact.icon
                  size={14}
                  weight="regular"
                  aria-hidden
                  className="shrink-0 text-ink-faint"
                />
                <dt className="sr-only">{fact.label}</dt>
                <dd className="[font-variant-numeric:tabular-nums]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="relative z-[var(--z-raised)] flex items-center justify-between gap-3">
          <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">
            {listing.code}
          </span>
          <WhatsAppLink
            source={source}
            variant="outline"
            className="px-3 py-2 text-[0.75rem]"
            context={{ title, code: listing.code }}
          >
            {dict.common.whatsapp}
          </WhatsAppLink>
        </div>
      </div>
    </article>
  );
}
