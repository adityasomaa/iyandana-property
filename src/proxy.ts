import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/site";

const LOCALE_COOKIE = "iyandana_locale";

/** Picks a language from the stored choice first, then the browser's list. */
function resolveLocale(request: NextRequest): Locale {
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;
  if (stored && (LOCALES as readonly string[]).includes(stored)) {
    return stored as Locale;
  }

  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (base === "id" || base === "in") return "id";
    if (base === "en") return "en";
  }
  return DEFAULT_LOCALE;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const first = pathname.split("/")[1];
  if ((LOCALES as readonly string[]).includes(first)) return NextResponse.next();

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals, the metadata files and anything with a
  // file extension, which covers /tiles, /fonts and /brand.
  matcher: [
    "/((?!_next/|api/|sitemap\\.xml|robots\\.txt|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
