"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { NAV_KEYS, path, type RouteKey } from "@/lib/routes";
import { COMPANY, FULL_ADDRESS, type Locale } from "@/lib/site";
import type { Dict } from "@/lib/dictionary";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { Wordmark } from "./Wordmark";

/**
 * Where the footer's own call to action points, in order of preference. The
 * first target that is not the page you are already on wins, so the footer
 * never offers you the page under your feet.
 */
const CTA_ORDER = ["listing", "construction", "consign", "contact"] as const;
type CtaKey = (typeof CTA_ORDER)[number];

export function Footer({ dict, locale }: { dict: Dict; locale: Locale }) {
  const pathname = usePathname();

  const isOn = (key: RouteKey) => {
    const target = path(locale, key);
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  const ctaKey: CtaKey = CTA_ORDER.find((key) => !isOn(key)) ?? "contact";
  const year = 2026;

  return (
    <footer className="border-t border-hair bg-sunk">
      <div className="mx-auto max-w-[84rem] px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeader
          sectionTitle={dict.footer.ctaSectionTitle}
          headline={dict.footer.ctaHeadline}
          body={dict.footer.ctaBody}
          cta={
            <>
              <WhatsAppLink source="footer-cta">
                {dict.common.whatsapp}
              </WhatsAppLink>
              <ButtonLink
                href={path(locale, ctaKey)}
                variant="outline"
                data-footer-cta={ctaKey}
              >
                {dict.nav[ctaKey]}
                <ArrowUpRight size={14} weight="bold" aria-hidden />
              </ButtonLink>
            </>
          }
        />

        <div className="mt-16 grid gap-10 border-t border-hair pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark className="text-ink" />
            <p className="mt-4 max-w-[34ch] text-[0.8125rem] leading-relaxed text-ink-soft">
              {COMPANY.legalName}
            </p>
            <p className="mt-3 max-w-[38ch] text-[0.75rem] leading-relaxed text-ink-faint">
              {dict.footer.previewNotice}
            </p>
          </div>

          <nav aria-label={dict.footer.navigate}>
            <h2 className="rule-label">{dict.footer.navigate}</h2>
            <ul className="mt-4 grid gap-2.5">
              {NAV_KEYS.map((key) => (
                <li key={key}>
                  <Link
                    href={path(locale, key)}
                    className="text-[0.8125rem] text-ink-soft transition-colors duration-200 hover:text-jade"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="rule-label">{dict.footer.office}</h2>
            <address className="mt-4 grid gap-2.5 not-italic text-[0.8125rem] leading-relaxed text-ink-soft">
              <span className="max-w-[30ch]">{FULL_ADDRESS}</span>
              {COMPANY.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="transition-colors duration-200 hover:text-jade [font-variant-numeric:tabular-nums]"
                >
                  {phone}
                </a>
              ))}
              <a
                href={`mailto:${COMPANY.email}`}
                className="break-all transition-colors duration-200 hover:text-jade"
              >
                {COMPANY.email}
              </a>
            </address>
          </div>

          <div>
            <h2 className="rule-label">{dict.footer.legal}</h2>
            <ul className="mt-4 grid gap-2.5">
              <li>
                <Link
                  href={path(locale, "privacy")}
                  className="text-[0.8125rem] text-ink-soft transition-colors duration-200 hover:text-jade"
                >
                  {dict.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={path(locale, "terms")}
                  className="text-[0.8125rem] text-ink-soft transition-colors duration-200 hover:text-jade"
                >
                  {dict.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-hair pt-6 text-[0.75rem] text-ink-faint">
          © {year} {COMPANY.legalName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
