import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { isLocale, type Locale } from "@/lib/site";
import { getDictionary, fill } from "@/lib/dictionary";
import { path } from "@/lib/routes";
import { latestListings, SAMPLE_DATA } from "@/lib/listings";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";
import { HeroSearch } from "@/components/home/HeroSearch";
import { ListingCard } from "@/components/listing/ListingCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);
  const listings = latestListings(6);

  return (
    <>
      {/* ------------------------------------------------------------- hero
          Exactly one screen tall, measured in svh so the mobile browser bars
          hiding on scroll does not resize it. What is on it, above the fold
          and with nothing over it, is the property search. */}
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-[calc(var(--header-h)+2rem)]">
        {/* The artwork is a static backdrop. It has no scroll-linked transform,
            so it never creeps or zooms as the page moves. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tiles/type-villa.svg"
            alt=""
            width={1600}
            height={1200}
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/88 to-paper/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/10 to-paper/55" />
        </div>

        <div className="mx-auto grid w-full max-w-[84rem] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <SplitText
              as="h1"
              text={dict.home.heroTitle}
              className="max-w-[19ch] text-[clamp(2.125rem,1.15rem+3vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.035em]"
              delay={480}
              step={13}
            />
            <p className="mt-7 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink-soft sm:text-base">
              {dict.home.heroLede}
            </p>
          </div>

          <div className="w-full lg:max-w-[26rem] lg:justify-self-end">
            <HeroSearch dict={dict} locale={typed} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- listings */}
      <section className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeader
          sectionTitle={dict.home.latest.sectionTitle}
          headline={dict.home.latest.headline}
          body={dict.home.latest.body}
          cta={
            <ButtonLink href={path(typed, "listing")} variant="outline">
              {dict.home.latest.cta}
              <ArrowRight size={14} weight="bold" aria-hidden />
            </ButtonLink>
          }
        />

        {SAMPLE_DATA ? (
          <p className="mt-8 border-l-[3px] border-jade bg-surface py-3 pl-4 pr-4 text-[0.8125rem] leading-relaxed text-ink-soft">
            {dict.common.sampleNoticeShort}
          </p>
        ) : null}

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => (
            <Reveal as="li" key={listing.code} delay={(i % 3) * 90}>
              <ListingCard
                listing={listing}
                dict={dict}
                locale={typed}
                isSample={SAMPLE_DATA}
                source="home-latest"
                priority={i < 3}
              />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------ construction
          A short block, not a second homepage. The line has its own page. */}
      <section className="border-y border-hair bg-sunk">
        <div className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeader
            sectionTitle={dict.home.construction.sectionTitle}
            headline={dict.home.construction.headline}
            body={dict.home.construction.body}
            cta={
              <>
                <ButtonLink href={path(typed, "construction")}>
                  {dict.home.construction.cta}
                  <ArrowUpRight size={14} weight="bold" aria-hidden />
                </ButtonLink>
                <WhatsAppLink source="home-construction" variant="outline">
                  {dict.common.whatsapp}
                </WhatsAppLink>
              </>
            }
          />

          <Reveal className="mt-12 overflow-hidden border border-hair bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tiles/type-konstruksi.svg"
              alt={fill(dict.detail.artworkAlt, {
                type: dict.types.konstruksi.toLowerCase(),
                n: 1,
              })}
              width={1600}
              height={1200}
              loading="lazy"
              className="aspect-[16/7] w-full object-cover"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
