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
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-24 pt-[calc(var(--header-h)+1.5rem)]">
        {/* The artwork is a static backdrop. It has no scroll-linked transform,
            so it never creeps or zooms as the page moves. */}
        {/* Full-bleed artwork with a solid paper column held over the left,
            rather than a wash over the whole frame. The wide crop keeps the
            pavilion and the water in shot, the artwork stays at full strength
            on the right, and the headline still sits on clean paper. Nothing
            here is scroll-linked, so it never creeps or zooms as the page
            moves. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tiles/type-villa.svg"
            alt=""
            width={1600}
            height={1200}
            fetchPriority="high"
            className="h-full w-full object-cover object-[50%_62%]"
          />
          {/* Small screens: the copy sits over the artwork, so it is veiled. */}
          <div className="absolute inset-0 bg-paper/80 lg:hidden" />
          {/* Wide screens: a solid column for the copy, feathered into the art. */}
          <div className="absolute inset-y-0 left-0 hidden w-[46%] bg-paper lg:block" />
          <div className="absolute inset-y-0 left-[46%] hidden w-48 bg-gradient-to-r from-paper to-transparent lg:block" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-paper to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-paper to-transparent" />
        </div>

        {/* The copy and the search sit in one column so the artwork on the
            right is never covered by the card. It also means the small-screen
            order is the same as the wide-screen one. */}
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-8">
          <div className="max-w-[34rem]">
            <SplitText
              as="h1"
              text={dict.home.heroTitle}
              className="text-[clamp(2.125rem,1.2rem+2.6vw,3rem)] font-medium leading-[1.04] tracking-[-0.035em]"
              delay={480}
              step={13}
            />
            <p className="mt-6 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink-soft sm:text-base">
              {dict.home.heroLede}
            </p>
            <div className="mt-8">
              <HeroSearch dict={dict} locale={typed} />
            </div>
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
