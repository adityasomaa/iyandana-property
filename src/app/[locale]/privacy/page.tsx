import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, SITE_URL, type Locale } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { path } from "@/lib/routes";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { CookieSettings } from "@/components/chrome/CookieConsent";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.privacy.title,
    description: dict.privacy.body,
    alternates: {
      canonical: `${SITE_URL}${path(locale, "privacy")}`,
      languages: {
        id: `${SITE_URL}${path("id", "privacy")}`,
        en: `${SITE_URL}${path("en", "privacy")}`,
      },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <div className="mx-auto max-w-[84rem] px-5 pb-24 pt-[calc(var(--header-h)+3rem)] sm:px-8">
      <SectionHeader
        as="h1"
        sectionTitle={dict.privacy.sectionTitle}
        headline={dict.privacy.headline}
        body={dict.privacy.body}
        cta={
          <ButtonLink href={path(typed, "contact")} variant="outline">
            {dict.privacy.cta}
          </ButtonLink>
        }
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="grid gap-8">
          {dict.privacy.sections.map((section) => (
            <section key={section.h}>
              <h2 className="text-[1.0625rem] leading-snug">{section.h}</h2>
              <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-relaxed text-ink-soft">
                {section.p}
              </p>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <CookieSettings dict={dict} />
        </aside>
      </div>
    </div>
  );
}
