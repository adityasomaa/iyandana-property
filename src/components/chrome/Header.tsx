"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { NAV_KEYS, path, type RouteKey } from "@/lib/routes";
import type { Dict } from "@/lib/dictionary";
import type { Locale } from "@/lib/site";
import { useOverlayLock } from "@/components/providers/SiteProviders";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Wordmark } from "./Wordmark";

export function Header({ dict, locale }: { dict: Dict; locale: Locale }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useOverlayLock("mobile-menu", menuOpen);

  // Close the menu whenever the route changes, so a link tap never leaves it up.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // The header gains its rule once the page has moved. Observed, not listened.
  useEffect(() => {
    const sentinel = document.getElementById("scroll-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        openerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isCurrent = (key: RouteKey) => {
    const target = path(locale, key);
    if (key === "home") return pathname === target || pathname === `/${locale}`;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-[var(--z-sticky-header)] h-[var(--header-h)] border-b bg-paper/85 backdrop-blur-lg transition-colors duration-300 ${
          scrolled ? "border-hair" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[84rem] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href={path(locale, "home")}
            className="shrink-0"
            aria-label={`Iyandana Property, ${dict.nav.home}`}
          >
            <Wordmark className="text-ink" />
          </Link>

          <nav
            aria-label={dict.nav.mainLabel}
            className="hidden lg:block"
          >
            <ul className="flex items-center gap-1">
              {NAV_KEYS.map((key) => (
                <li key={key}>
                  <Link
                    href={path(locale, key)}
                    aria-current={isCurrent(key) ? "page" : undefined}
                    className={`inline-block whitespace-nowrap px-3 py-2 text-[0.8125rem] transition-colors duration-200 ${
                      isCurrent(key)
                        ? "text-jade"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher
              locale={locale}
              className="hidden w-[9.5rem] sm:block"
            />
            {/* Wrapped rather than given a `hidden` class: the button's own
                base styles set `inline-flex`, and in the utilities layer that
                wins over `hidden` regardless of class order. */}
            <span className="hidden xl:block">
              <WhatsAppLink
                source="header"
                variant="solid"
                className="px-4 py-2.5 text-[0.75rem]"
              >
                {dict.common.whatsapp}
              </WhatsAppLink>
            </span>
            <button
              ref={openerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              aria-label={dict.nav.openMenu}
              className="field-shell grid h-10 w-10 place-items-center lg:hidden"
            >
              <List size={17} weight="bold" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[var(--z-mobile-menu)] lg:hidden">
          <button
            type="button"
            aria-label={dict.nav.closeMenu}
            onClick={() => {
              setMenuOpen(false);
              openerRef.current?.focus();
            }}
            className="absolute inset-0 h-full w-full bg-ink/45 backdrop-blur-[2px]"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.mainLabel}
            tabIndex={-1}
            className="absolute inset-x-0 top-0 max-h-[100svh] overflow-y-auto overscroll-contain border-b border-control bg-paper p-5 outline-none"
          >
            <div className="flex h-[calc(var(--header-h)-1.25rem)] items-center justify-between">
              <Wordmark className="text-ink" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openerRef.current?.focus();
                }}
                aria-label={dict.nav.closeMenu}
                className="field-shell grid h-10 w-10 place-items-center"
              >
                <X size={17} weight="bold" aria-hidden />
              </button>
            </div>

            <ul className="mt-4 grid divide-y divide-hair border-y border-hair">
              {NAV_KEYS.map((key) => (
                <li key={key}>
                  <Link
                    href={path(locale, key)}
                    aria-current={isCurrent(key) ? "page" : undefined}
                    className={`block py-4 text-lg ${
                      isCurrent(key) ? "text-jade" : "text-ink"
                    }`}
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-3">
              <LanguageSwitcher locale={locale} align="start" />
              <WhatsAppLink source="mobile-menu" className="w-full">
                {dict.common.whatsapp}
              </WhatsAppLink>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
