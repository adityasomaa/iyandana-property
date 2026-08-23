"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { wait } from "@/lib/wait";
import { path } from "@/lib/routes";
import type { Locale } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { NoiseTexture } from "@/components/vendor/noise-texture";

const SLATS = 5;
const SLAT_MS = 620;
const STAGGER_MS = 70;
const CLOSE_MS = SLAT_MS + STAGGER_MS * (SLATS - 1);
const OPEN_MS = CLOSE_MS;
/** If a route never commits, open the curtain anyway rather than trap the page. */
const NAV_TIMEOUT_MS = 4000;

type Phase = "idle" | "closing" | "holding" | "opening";

/**
 * Route transitions.
 *
 * The sequence is: the page closes, the content changes behind the closed
 * curtain, the scroll position is reset while still covered, then the page
 * opens. Nothing the visitor can see moves during the swap.
 *
 * Every step waits on `wait()`, which races a timer against the frame loop, so
 * backgrounding the tab mid-transition cannot leave the curtain stuck shut.
 *
 * Navigating to the home page uses the same curtain with the wordmark held in
 * the middle, which is the intro treatment; every other route uses the plain
 * slats.
 */
export function PageTransition({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("idle");
  const [toHome, setToHome] = useState(false);
  const pending = useRef<string | null>(null);
  const startedFrom = useRef<string>(pathname);

  const run = useCallback(
    async (href: string) => {
      pending.current = href;
      startedFrom.current = window.location.pathname;
      setToHome(new URL(href, window.location.origin).pathname === path(locale, "home"));
      setPhase("closing");

      await wait(CLOSE_MS);
      // Content changes now, entirely behind the closed curtain.
      router.push(href);
      setPhase("holding");
    },
    [router, locale],
  );

  // Intercept in-app navigation. Anything that is not a plain left click on an
  // internal link is left to the browser.
  //
  // This listens in the CAPTURE phase on purpose. React's delegated handler is
  // attached to the same document and runs first in the bubble phase, and
  // next/link's own handler calls preventDefault there to start its client
  // navigation. A bubble-phase listener here would only ever see an already
  // handled click and the curtain would never play.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.dataset.noTransition !== undefined) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
        return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search)
        return;

      // We are taking this navigation over, so next/link must not also run.
      event.preventDefault();
      event.stopPropagation();
      void run(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [run]);

  // The new route has committed: reset the scroll under cover, then open.
  useEffect(() => {
    if (phase !== "holding") return;
    if (pathname === startedFrom.current) return;

    let cancelled = false;
    (async () => {
      window.scrollTo(0, 0);
      // One breath at full cover so the swap never reads as a flicker.
      await wait(120);
      if (cancelled) return;
      setPhase("opening");
      await wait(OPEN_MS);
      if (cancelled) return;
      setPhase("idle");
      pending.current = null;
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, pathname]);

  // A route that never arrives must not hold the curtain shut.
  useEffect(() => {
    if (phase !== "holding") return;
    const t = window.setTimeout(() => {
      window.scrollTo(0, 0);
      setPhase("opening");
      window.setTimeout(() => setPhase("idle"), OPEN_MS);
    }, NAV_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // The browser's own back and forward should not be swallowed by the curtain.
  useEffect(() => {
    const onPopState = () => {
      setPhase("idle");
      pending.current = null;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const covered = phase === "closing" || phase === "holding";

  return (
    <>
      {children}
      <div
        aria-hidden
        data-phase={phase}
        className="curtain"
        style={{ pointerEvents: phase === "idle" ? "none" : "auto" }}
      >
        {Array.from({ length: SLATS }, (_, i) => (
          <span
            key={i}
            className="curtain__slat"
            style={{
              transitionDelay: `${
                (phase === "opening" ? SLATS - 1 - i : i) * STAGGER_MS
              }ms`,
            }}
          />
        ))}
        <span className="curtain__grain">
          <NoiseTexture opacity={0.05} grain="medium" blend="multiply" />
        </span>
        {toHome ? (
          <span className="curtain__mark" data-visible={covered}>
            <Wordmark className="text-ink" />
          </span>
        ) : null}
      </div>
    </>
  );
}
