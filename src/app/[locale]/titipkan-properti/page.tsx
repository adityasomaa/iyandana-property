import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

import { isLocale, SITE_URL, type Locale } from "@/lib/site";
import { getDictionary, fill } from "@/lib/dictionary";
import { path } from "@/lib/routes";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { BreadcrumbSchema } from "@/components/seo/Schema";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.consign.title,
    description: dict.consign.hero.body,
    alternates: {
      canonical: `${SITE_URL}${path(locale, "consign")}`,
      languages: {
        id: `${SITE_URL}${path("id", "consign")}`,
        en: `${SITE_URL}${path("en", "consign")}`,
      },
    },
  };
}

export default async function ConsignPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);
  const c = dict.consign;

  return (
    <>
      <section className="border-b border-hair">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 pb-16 pt-[calc(var(--header-h)+3rem)] sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16 lg:pb-24">
          <SectionHeader
            as="h1"
            align="start"
            sectionTitle={c.hero.sectionTitle}
            headline={c.hero.headline}
            body={c.hero.body}
            cta={
              <>
                <ButtonLink href="#formulir" data-no-transition>
                  {c.hero.cta}
                  <ArrowDown size={14} weight="bold" aria-hidden />
                </ButtonLink>
                <WhatsAppLink source="consign-hero" variant="outline">
                  {dict.common.whatsapp}
                </WhatsAppLink>
              </>
            }
          />

          <div className="overflow-hidden border border-hair bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tiles/type-rumah.svg"
              alt={fill(dict.detail.artworkAlt, {
                type: dict.types.rumah.toLowerCase(),
                n: 1,
              })}
              width={1600}
              height={1200}
              fetchPriority="high"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeader
          sectionTitle={c.steps.sectionTitle}
          headline={c.steps.headline}
          body={c.steps.body}
          cta={
            <ButtonLink href="#formulir" variant="outline" data-no-transition>
              {c.steps.cta}
            </ButtonLink>
          }
        />

        <ol className="mt-12 grid gap-px border border-hair bg-hair sm:grid-cols-3">
          {c.steps.items.map((item, i) => (
            <li key={item.name} className="bg-paper p-7">
              <span className="block text-[0.6875rem] font-medium tracking-[0.16em] text-jade [font-variant-numeric:tabular-nums]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-[1.0625rem] leading-snug">{item.name}</h3>
              <p className="mt-3 max-w-[40ch] text-[0.875rem] leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="formulir"
        className="border-t border-hair bg-sunk"
      >
        <div className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeader
            sectionTitle={c.form.sectionTitle}
            headline={c.form.headline}
            body={c.form.body}
            cta={
              <WhatsAppLink source="consign-form-header" variant="outline">
                {dict.common.whatsapp}
              </WhatsAppLink>
            }
          />
          <div className="mt-12 max-w-[52rem]">
            <EnquiryForm kind="consign" dict={dict} locale={typed} />
          </div>
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: dict.nav.home, url: `${SITE_URL}${path(typed, "home")}` },
          { name: dict.nav.consign, url: `${SITE_URL}${path(typed, "consign")}` },
        ]}
      />
    </>
  );
}
