import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";

import { LOCALES, SITE_URL, isLocale, type Locale } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { SiteProviders } from "@/components/providers/SiteProviders";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { IntroLoader } from "@/components/chrome/IntroLoader";
import { PageTransition } from "@/components/chrome/PageTransition";
import { CookieConsent } from "@/components/chrome/CookieConsent";
import { OrganizationSchema } from "@/components/seo/Schema";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#f4f2ec",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  const title =
    locale === "id"
      ? "Iyandana Property - Properti dan Konstruksi di Bali"
      : "Iyandana Property - Property and Construction in Bali";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s - Iyandana Property" },
    description: dict.home.heroLede,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        id: `${SITE_URL}/id`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/id`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Iyandana Property",
      locale: locale === "id" ? "id_ID" : "en_US",
      url: `${SITE_URL}/${locale}`,
      title,
      description: dict.home.heroLede,
    },
    twitter: { card: "summary_large_image", title, description: dict.home.heroLede },
    icons: {
      icon: [
        { url: "/brand/mark-96.png", sizes: "96x96", type: "image/png" },
        { url: "/brand/mark-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/brand/mark-180.png", sizes: "180x180", type: "image/png" }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const dict = getDictionary(typed);

  return (
    <html lang={typed}>
      <body>
        <SiteProviders locale={typed}>
          <a
            href="#main"
            className="fixed left-4 top-4 z-[var(--z-skip-link)] -translate-y-[200%] bg-jade px-4 py-3 text-[0.8125rem] text-on-jade transition-transform duration-200 focus-visible:translate-y-0"
          >
            {dict.nav.skipToContent}
          </a>

          <IntroLoader />
          <SmoothScroll />

          <PageTransition locale={typed}>
            <div id="scroll-sentinel" aria-hidden className="absolute top-0 h-px w-px" />
            <Header dict={dict} locale={typed} />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer dict={dict} locale={typed} />
          </PageTransition>

          <CookieConsent dict={dict} locale={typed} />
          <OrganizationSchema locale={typed} />
        </SiteProviders>
      </body>
    </html>
  );
}
