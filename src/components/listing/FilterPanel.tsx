"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FunnelSimple, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { useOverlayLock } from "@/components/providers/SiteProviders";
import { FilterFields, KeywordField } from "./FilterFields";
import {
  isQueryEmpty,
  queryToSearchParams,
  type Query,
} from "@/lib/listings";
import { path } from "@/lib/routes";
import type { Dict } from "@/lib/dictionary";
import type { Locale } from "@/lib/site";

/**
 * Filtering for the listing index.
 *
 * State lives in the URL, so results are server-rendered, shareable and
 * survive a reload. On desktop the fields sit in a column beside the grid; on
 * small screens the same fields move into a drawer that locks page scroll while
 * it is open and releases it on close.
 */
export function FilterPanel({
  dict,
  locale,
  locations,
  initial,
  resultCount,
}: {
  dict: Dict;
  locale: Locale;
  locations: string[];
  initial: Query;
  resultCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<Query>(initial);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useOverlayLock("filter-panel", open);

  // The URL is the source of truth: a back button or a shared link must win
  // over whatever the fields happened to hold.
  useEffect(() => {
    setDraft(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const apply = (next: Query) => {
    const params = queryToSearchParams(next).toString();
    router.replace(`${path(locale, "listing")}${params ? `?${params}` : ""}`, {
      scroll: false,
    });
  };

  const patch = (delta: Partial<Query>) => {
    const next = { ...draft, ...delta };
    setDraft(next);
    apply(next);
  };

  const reset = () => {
    const next: Query = {
      q: "",
      type: "",
      status: "",
      location: "",
      min: null,
      max: null,
      sort: "default",
    };
    setDraft(next);
    apply(next);
  };

  // Escape closes the drawer and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        openerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const fields = (
    <div className="grid gap-4">
      <KeywordField
        dict={dict}
        value={draft.q ?? ""}
        onChange={(q) => patch({ q })}
      />
      <FilterFields
        dict={dict}
        locations={locations}
        value={draft}
        onChange={patch}
        showSort
      />
      <button
        type="button"
        onClick={reset}
        disabled={isQueryEmpty(draft)}
        className="justify-self-start text-[0.8125rem] text-jade underline underline-offset-4 disabled:cursor-not-allowed disabled:text-ink-faint disabled:no-underline"
      >
        {dict.search.reset}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop: a plain column. No drawer, no overlay, no scroll lock. */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+1.5rem)]">
          <h2 className="rule-label">{dict.search.filters}</h2>
          <div className="mt-5">{fields}</div>
        </div>
      </div>

      {/* Small screens: a button that opens the same fields in a drawer. */}
      <div className="lg:hidden">
        <button
          ref={openerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="field-shell flex h-11 w-full items-center justify-center gap-2 px-4 text-[0.8125rem] font-medium"
        >
          <FunnelSimple size={15} weight="bold" aria-hidden />
          {dict.search.openFilters}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[var(--z-filter-panel)] lg:hidden">
          <button
            type="button"
            aria-label={dict.common.close}
            onClick={() => {
              setOpen(false);
              openerRef.current?.focus();
            }}
            className="absolute inset-0 h-full w-full bg-ink/45 backdrop-blur-[2px]"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.search.filters}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 max-h-[86svh] overflow-y-auto overscroll-contain border-t border-control bg-paper p-5 pb-8 outline-none"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-base font-medium">{dict.search.filters}</h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openerRef.current?.focus();
                }}
                aria-label={dict.common.close}
                className="field-shell grid h-9 w-9 place-items-center"
              >
                <X size={15} weight="bold" aria-hidden />
              </button>
            </div>

            {fields}

            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => {
                setOpen(false);
                openerRef.current?.focus();
              }}
            >
              {dict.search.applyFilters}
              <span className="opacity-70">({resultCount})</span>
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
