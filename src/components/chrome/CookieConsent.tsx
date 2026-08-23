"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Button } from "@/components/ui/Button";
import { useOverlayCount } from "@/components/providers/SiteProviders";
import { path } from "@/lib/routes";
import type { Dict } from "@/lib/dictionary";
import type { Locale } from "@/lib/site";

const COOKIE = "iyandana_consent";
type Choice = "accepted" | "declined" | null;

function readChoice(): Choice {
  if (typeof document === "undefined") return null;
  const hit = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE}=`));
  const value = hit?.split("=")[1];
  return value === "accepted" || value === "declined" ? value : null;
}

function writeChoice(choice: Exclude<Choice, null>) {
  document.cookie = `${COOKIE}=${choice}; path=/; max-age=15552000; samesite=lax`;
}

/**
 * Cookie consent that actually decides something.
 *
 * Declining is the state the page starts in: no analytics component is
 * mounted, so no statistics script is requested at all. Accepting mounts it.
 * The difference is visible in the network panel, not just in a stored flag.
 *
 * Placement rules this bar has to respect:
 *  - It never shows while the mobile menu, the filter panel or the lightbox is
 *    open, even though its layer token sits above them.
 *  - While it is up it publishes its own height, so the floating enquiry bar on
 *    listing pages sits above it instead of underneath it.
 */
export function CookieConsent({
  dict,
  locale,
}: {
  dict: Dict;
  locale: Locale;
}) {
  const [choice, setChoice] = useState<Choice>(null);
  const [asked, setAsked] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);
  const overlays = useOverlayCount();

  useEffect(() => {
    const stored = readChoice();
    setChoice(stored);
    setAsked(stored !== null);
  }, []);

  const visible = !asked && overlays === 0;

  // Publish the bar's height so nothing else has to guess it.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.removeProperty("--cookie-h");
      root.removeAttribute("data-cookie-banner");
      return;
    }
    root.setAttribute("data-cookie-banner", "true");
    const measure = () => {
      const h = barRef.current?.offsetHeight ?? 0;
      root.style.setProperty("--cookie-h", `${h}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (barRef.current) observer.observe(barRef.current);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--cookie-h");
      root.removeAttribute("data-cookie-banner");
    };
  }, [visible]);

  const decide = useCallback((next: Exclude<Choice, null>) => {
    writeChoice(next);
    setChoice(next);
    setAsked(true);
  }, []);

  return (
    <>
      {choice === "accepted" ? <Analytics /> : null}

      {visible ? (
        <div
          ref={barRef}
          role="region"
          aria-label={dict.cookies.title}
          className="fixed inset-x-0 bottom-0 z-[var(--z-cookie)] border-t border-control bg-surface"
        >
          <div className="mx-auto flex max-w-[84rem] flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-[68ch] text-[0.8125rem] leading-relaxed text-ink-soft">
              {dict.cookies.body}{" "}
              <Link
                href={path(locale, "privacy")}
                className="text-jade underline underline-offset-4"
              >
                {dict.cookies.settings}
              </Link>
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => decide("declined")}
                className="px-4 py-2.5 text-[0.75rem]"
              >
                {dict.cookies.decline}
              </Button>
              <Button
                onClick={() => decide("accepted")}
                className="px-4 py-2.5 text-[0.75rem]"
              >
                {dict.cookies.accept}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * The control that lets someone change their mind later. It lives on the
 * privacy page, which is where the banner's own link points.
 */
export function CookieSettings({ dict }: { dict: Dict }) {
  const [choice, setChoice] = useState<Choice>(null);

  useEffect(() => {
    setChoice(readChoice());
  }, []);

  const set = (next: Exclude<Choice, null>) => {
    writeChoice(next);
    setChoice(next);
  };

  return (
    <div className="border border-hair bg-surface p-6">
      <h2 className="text-lg">{dict.cookies.manage}</h2>
      <p className="mt-3 max-w-[62ch] text-[0.875rem] leading-relaxed text-ink-soft">
        {choice === "accepted"
          ? dict.cookies.statusAccepted
          : dict.cookies.statusDeclined}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          variant={choice === "declined" ? "solid" : "outline"}
          onClick={() => set("declined")}
          className="px-4 py-2.5 text-[0.75rem]"
        >
          {dict.cookies.decline}
        </Button>
        <Button
          variant={choice === "accepted" ? "solid" : "outline"}
          onClick={() => set("accepted")}
          className="px-4 py-2.5 text-[0.75rem]"
        >
          {dict.cookies.accept}
        </Button>
      </div>
    </div>
  );
}
