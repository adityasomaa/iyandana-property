import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  isLocale,
  SITE_URL,
  COMPANY,
  FULL_ADDRESS,
  type Locale,
} from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { path } from "@/lib/routes";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { BreadcrumbSchema } from "@/components/seo/Schema";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.contact.title,
    description: dict.contact.hero.body,
    alternates: {
      canonical: `${SITE_URL}${path(locale, "contact")}`,
      languages: {
        id: `${SITE_URL}${path("id", "contact")}`,
        en: `${SITE_URL}${path("en", "contact")}`,
      },
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);
  const c = dict.contact;

  const mapQuery = encodeURIComponent(`${FULL_ADDRESS}, Indonesia`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <>
      <section className="border-b border-hair">
        <div className="mx-auto max-w-[84rem] px-5 pb-16 pt-[calc(var(--header-h)+3rem)] sm:px-8 lg:pb-24">
          <SectionHeader
            as="h1"
            sectionTitle={c.hero.sectionTitle}
            headline={c.hero.headline}
            body={c.hero.body}
            cta={
              <WhatsAppLink source="contact-hero">{c.hero.cta}</WhatsAppLink>
            }
          />
        </div>
      </section>

      {/* --------------------------------------------------------- details */}
      <section className="mx-auto max-w-[84rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeader
          sectionTitle={c.details.sectionTitle}
          headline={c.details.headline}
          body={c.details.body}
          cta={
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.8125rem] text-jade underline underline-offset-4"
            >
              {c.details.cta}
            </a>
          }
        />

        <div className="mt-12 grid gap-px border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-paper p-7">
            <h3 className="rule-label">{c.details.address}</h3>
            <address className="mt-4 not-italic text-[0.875rem] leading-relaxed text-ink-soft">
              {COMPANY.legalName}
              <br />
              {FULL_ADDRESS}
            </address>
          </div>

          <div className="bg-paper p-7">
            <h3 className="rule-label">{c.details.phone}</h3>
            <ul className="mt-4 grid gap-2 text-[0.875rem] text-ink-soft">
              {COMPANY.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="transition-colors duration-200 hover:text-jade [font-variant-numeric:tabular-nums]"
                  >
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-paper p-7">
            <h3 className="rule-label">{c.details.email}</h3>
            <p className="mt-4 text-[0.875rem] text-ink-soft">
              <a
                href={`mailto:${COMPANY.email}`}
                className="break-all transition-colors duration-200 hover:text-jade"
              >
                {COMPANY.email}
              </a>
            </p>
          </div>

          <div className="bg-paper p-7">
            <h3 className="rule-label">{c.details.hours}</h3>
            <dl className="mt-4 grid gap-2 text-[0.875rem] text-ink-soft">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <dt>{c.details.hoursWeekday}</dt>
                <dd className="[font-variant-numeric:tabular-nums]">
                  08.00 - 17.00 {c.details.wita}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <dt>{c.details.hoursSaturday}</dt>
                <dd className="[font-variant-numeric:tabular-nums]">
                  08.00 - 15.00 {c.details.wita}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <dt>{c.details.hoursSunday}</dt>
                <dd>{c.details.byAppointment}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- other services
          Deliberately the shortest section on the site, and the only place the
          group's financing service is mentioned. It names that the service
          exists and points at WhatsApp. It carries no timing, no eligibility
          rule, no rate, no ceiling and no figure of any kind, because we do not
          have the real terms and this is a regulated area. See the README. */}
      <section className="border-t border-hair bg-sunk">
        <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 sm:py-20">
          <SectionHeader
            sectionTitle={c.other.sectionTitle}
            headline={c.other.headline}
            body={c.other.body}
            cta={
              <WhatsAppLink source="contact-other-services" variant="outline">
                {c.other.cta}
              </WhatsAppLink>
            }
          />
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: dict.nav.home, url: `${SITE_URL}${path(typed, "home")}` },
          { name: dict.nav.contact, url: `${SITE_URL}${path(typed, "contact")}` },
        ]}
      />
    </>
  );
}
