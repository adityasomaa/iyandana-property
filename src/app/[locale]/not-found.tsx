import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/site";
import { getDictionary } from "@/lib/dictionary";
import { path } from "@/lib/routes";
import { buttonClass } from "@/components/ui/Button";

/**
 * A not-found page cannot read the route params, so it answers in the default
 * language and offers a way back rather than guessing.
 */
export default function LocaleNotFound() {
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-[84rem] flex-col justify-center px-5 py-24 sm:px-8">
      <p className="rule-label">{dict.notFound.sectionTitle}</p>
      <h1 className="mt-6 max-w-[18ch] text-[clamp(1.9rem,1.3rem+2.6vw,3.25rem)] leading-[1.05]">
        {dict.notFound.headline}
      </h1>
      <p className="mt-5 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink-soft">
        {dict.notFound.body}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={path(DEFAULT_LOCALE, "home")} className={buttonClass("solid")}>
          {dict.notFound.cta}
        </Link>
        <Link
          href={path(DEFAULT_LOCALE, "listing")}
          className={buttonClass("outline")}
        >
          {dict.nav.listing}
        </Link>
      </div>
    </div>
  );
}
