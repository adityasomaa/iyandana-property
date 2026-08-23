import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

import { isLocale, SITE_URL, type Locale } from "@/lib/site";
import { getDictionary, fill } from "@/lib/dictionary";
import { path } from "@/lib/routes";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { Reveal } from "@/components/ui/Reveal";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { BreadcrumbSchema } from "@/components/seo/Schema";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.construction.title,
    description: dict.construction.hero.body,
    alternates: {
      canonical: `${SITE_URL}${path(locale, "construction")}`,
      languages: {
        id: `${SITE_URL}${path("id", "construction")}`,
        en: `${SITE_URL}${path("en", "construction")}`,
      },
    },
  };
}

export default async function ConstructionPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);
  const c = dict.construction;

  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-hair">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 pb-16 pt-[calc(var(--header-h)+3rem)] sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16 lg:pb-24">
          <SectionHeader
            as="h1"
            align="start"
            sectionTitle={c.hero.sectionTitle}
            headline={c.hero.headline}
            body={c.hero.body}
            cta={
              <>
                <WhatsAppLink source="construction-hero">
                  {c.hero.cta}
                </WhatsAppLink>
                <ButtonLink href="#tanya" variant="outline" data-no-transition>
                  {c.form.cta}
                  <ArrowDown size={14} weight="bold" aria-hidden />
                </ButtonLink>
              </>
            }
          />

          <div className="overflow-hidden border border-hair bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tiles/konstruksi-panel-0.svg"
              alt={fill(dict.detail.artworkAlt, {
                type: dict.types.konstruksi.toLowerCase(),
                n: 1,
              })}
              width={1600}
              height={1200}
              fetchPriority="high"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ scope */}
      <section className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeader
          sectionTitle={c.scope.sectionTitle}
          headline={c.scope.headline}
          body={c.scope.body}
          cta={
            <WhatsAppLink source="construction-scope" variant="outline">
              {c.scope.cta}
            </WhatsAppLink>
          }
        />

        <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {c.scope.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.name}
              delay={(i % 3) * 80}
              className="border-t border-hair py-7"
            >
              <h3 className="text-[1.0625rem] leading-snug">{item.name}</h3>
              <p className="mt-3 max-w-[42ch] text-[0.875rem] leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- process
          Numbered because the order is the information: each step depends on
          the one before it. */}
      <section className="border-y border-hair bg-sunk">
        <div className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeader
            sectionTitle={c.process.sectionTitle}
            headline={c.process.headline}
            body={c.process.body}
            cta={
              <ButtonLink href="#tanya" data-no-transition>
                {c.process.cta}
              </ButtonLink>
            }
          />

          <ol className="mt-12 grid gap-px border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-3">
            {c.process.steps.map((step, i) => (
              <li key={step.name} className="bg-paper p-7">
                <span className="block text-[0.6875rem] font-medium tracking-[0.16em] text-jade [font-variant-numeric:tabular-nums]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-[1.0625rem] leading-snug">
                  {step.name}
                </h3>
                <p className="mt-3 max-w-[40ch] text-[0.875rem] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-8 max-w-[70ch] text-[0.8125rem] leading-relaxed text-ink-faint">
            {c.noProjects}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- form */}
      <section id="tanya" className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeader
          sectionTitle={c.form.sectionTitle}
          headline={c.form.headline}
          body={c.form.body}
          cta={
            <WhatsAppLink source="construction-form-header" variant="outline">
              {dict.common.whatsapp}
            </WhatsAppLink>
          }
        />
        <div className="mt-12 max-w-[52rem]">
          <EnquiryForm kind="construction" dict={dict} locale={typed} />
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: dict.nav.home, url: `${SITE_URL}${path(typed, "home")}` },
          {
            name: dict.nav.construction,
            url: `${SITE_URL}${path(typed, "construction")}`,
          },
        ]}
      />
    </>
  );
}
