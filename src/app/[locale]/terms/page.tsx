import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, SITE_URL, type Locale } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { path } from "@/lib/routes";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.terms.title,
    description: dict.terms.body,
    alternates: {
      canonical: `${SITE_URL}${path(locale, "terms")}`,
      languages: {
        id: `${SITE_URL}${path("id", "terms")}`,
        en: `${SITE_URL}${path("en", "terms")}`,
      },
    },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <div className="mx-auto max-w-[84rem] px-5 pb-24 pt-[calc(var(--header-h)+3rem)] sm:px-8">
      <SectionHeader
        as="h1"
        sectionTitle={dict.terms.sectionTitle}
        headline={dict.terms.headline}
        body={dict.terms.body}
        cta={
          <ButtonLink href={path(typed, "contact")} variant="outline">
            {dict.terms.cta}
          </ButtonLink>
        }
      />

      <div className="mt-14 grid max-w-[70ch] gap-8">
        {dict.terms.sections.map((section) => (
          <section key={section.h}>
            <h2 className="text-[1.0625rem] leading-snug">{section.h}</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
              {section.p}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
