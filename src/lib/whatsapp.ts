import { COMPANY, SITE_URL, type Locale } from "./site";

export type WhatsAppContext = {
  /** Listing title, when the enquiry is about one property. */
  title?: string;
  /** Listing code, when the enquiry is about one property. */
  code?: string;
  /** Extra lines, already labelled, e.g. from a form. */
  lines?: string[];
};

const OPENER: Record<Locale, string> = {
  id: "Halo Iyandana Property.",
  en: "Hello Iyandana Property.",
};

const ABOUT: Record<Locale, string> = {
  id: "Saya ingin bertanya mengenai:",
  en: "I would like to ask about:",
};

const GENERAL: Record<Locale, string> = {
  id: "Saya ingin bertanya lewat website.",
  en: "I have a question from your website.",
};

const LABELS: Record<Locale, { code: string; page: string; button: string }> = {
  id: { code: "Kode listing", page: "Halaman", button: "Tombol" },
  en: { code: "Listing code", page: "Page", button: "Button" },
};

/**
 * Builds the wa.me URL for one enquiry.
 *
 * Every message carries the page it came from and the button that produced it,
 * so an enquiry arriving on WhatsApp can be traced back to a specific place on
 * the site without any tracking script.
 *
 * @param source stable slug for the button, e.g. "listing-card" or "footer-cta"
 * @param pathname the page path the button sits on, including any query
 */
export function buildWhatsAppUrl({
  locale,
  source,
  pathname,
  context = {},
}: {
  locale: Locale;
  source: string;
  pathname: string;
  context?: WhatsAppContext;
}): string {
  const label = LABELS[locale];
  const url = `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

  const body: string[] = [OPENER[locale], ""];

  if (context.title) {
    body.push(ABOUT[locale], context.title);
    if (context.code) body.push(`${label.code}: ${context.code}`);
  } else {
    body.push(GENERAL[locale]);
  }

  if (context.lines?.length) {
    body.push("", ...context.lines);
  }

  body.push("", `${label.page}: ${url}`, `${label.button}: ${source}`);

  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(body.join("\n"))}`;
}
