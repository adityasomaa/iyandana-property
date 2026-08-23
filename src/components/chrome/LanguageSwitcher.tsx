"use client";

import { usePathname, useRouter } from "next/navigation";
import { Listbox } from "@/components/ui/Listbox";
import { swapLocale } from "@/lib/routes";
import { LOCALES, type Locale } from "@/lib/site";
import { DICTIONARIES } from "@/lib/dictionary";

export const LOCALE_COOKIE = "iyandana_locale";

/**
 * Language choice. Two things happen on change: the path swaps its locale
 * segment, and the choice is written to a cookie so the next visit and any
 * bare `/` land in the same language.
 */
export function LanguageSwitcher({
  locale,
  align = "end",
  className = "",
}: {
  locale: Locale;
  align?: "start" | "end";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Short forms: the trigger sits in a fixed-width slot in the header and the
  // full name wraps to two lines there.
  const options = LOCALES.map((code) => ({
    value: code,
    label: code === "id" ? "Indonesia" : "English",
  }));

  const change = (next: string) => {
    if (!LOCALES.includes(next as Locale)) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Read the query here rather than through useSearchParams: the hook would
    // pull every page that renders the header out of static prerendering, and
    // the current query is available on window at the moment of the click.
    const search = window.location.search;
    router.push(`${swapLocale(pathname, next as Locale)}${search}`);
  };

  return (
    <Listbox
      label={DICTIONARIES[locale].meta.switchLabel}
      options={options}
      value={locale}
      onChange={change}
      lockScroll
      align={align}
      className={className}
    />
  );
}
