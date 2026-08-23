import type { ReactNode } from "react";
import { TextAnimate } from "@/components/vendor/text-animate";

type Props = {
  /** Small label naming the section. */
  sectionTitle: string;
  headline: string;
  body: string;
  /** Always present: every section ends its header with a way forward. */
  cta: ReactNode;
  align?: "start" | "between";
  as?: "h2" | "h1";
  className?: string;
};

/**
 * The one section header used by every section on the site.
 *
 * Four parts, always in this order: section title, headline, short description,
 * call to action. Keeping it in a single component is what makes the rhythm of
 * the page consistent rather than incidental.
 */
export function SectionHeader({
  sectionTitle,
  headline,
  body,
  cta,
  align = "between",
  as: Heading = "h2",
  className = "",
}: Props) {
  return (
    <header className={className}>
      <p className="rule-label flex items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-px w-8 shrink-0 bg-jade opacity-60"
        />
        {sectionTitle}
      </p>

      <div
        className={
          align === "between"
            ? "mt-6 grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
            : "mt-6 grid gap-6"
        }
      >
        <div className="max-w-[42ch]">
          {/* One shared entrance for every section headline, so the rhythm of
              the page is a system rather than a per-section decision. */}
          <TextAnimate
            as={Heading}
            by="word"
            animation="blurInUp"
            duration={0.5}
            className="text-[clamp(1.75rem,1.15rem+2.4vw,3rem)] leading-[1.05]"
          >
            {headline}
          </TextAnimate>
          <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-soft">
            {body}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          {cta}
        </div>
      </div>
    </header>
  );
}
