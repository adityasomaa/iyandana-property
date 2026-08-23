"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Listbox } from "@/components/ui/Listbox";
import { Button } from "@/components/ui/Button";
import { typeOptions, statusOptions } from "@/components/listing/FilterFields";
import { queryToSearchParams, type Query } from "@/lib/listings";
import { path } from "@/lib/routes";
import type { Dict } from "@/lib/dictionary";
import type { Locale } from "@/lib/site";
import type { PropertyType, ListingStatus } from "@/data/types";

/**
 * The search that sits inside the hero. Deliberately the first interactive
 * thing on the page: someone arriving to look at property can start looking
 * without scrolling and without dismissing anything.
 */
export function HeroSearch({ dict, locale }: { dict: Dict; locale: Locale }) {
  const router = useRouter();
  const [query, setQuery] = useState<Query>({ q: "", type: "", status: "" });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = queryToSearchParams(query).toString();
    router.push(`${path(locale, "listing")}${params ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      className="w-full border border-hair bg-surface/95 p-4 shadow-[0_28px_70px_-40px_rgba(20,32,27,0.55)] backdrop-blur-md sm:p-5"
    >
      <h2 className="rule-label">{dict.home.searchHeading}</h2>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-2">
          <label
            htmlFor="hero-keyword"
            className="text-[0.75rem] font-medium text-ink-soft"
          >
            {dict.search.keyword}
          </label>
          <div className="field-shell flex h-11 items-center gap-2 px-3 focus-within:border-jade">
            <MagnifyingGlass
              size={15}
              weight="bold"
              aria-hidden
              className="shrink-0 text-ink-faint"
            />
            <input
              id="hero-keyword"
              type="search"
              autoComplete="off"
              value={query.q ?? ""}
              onChange={(e) => setQuery((p) => ({ ...p, q: e.target.value }))}
              placeholder={dict.search.keywordPlaceholder}
              className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-faint"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <span className="text-[0.75rem] font-medium text-ink-soft">
              {dict.search.type}
            </span>
            <Listbox
              label={dict.search.type}
              options={typeOptions(dict)}
              value={query.type ?? ""}
              onChange={(v) =>
                setQuery((p) => ({ ...p, type: v as PropertyType | "" }))
              }
            />
          </div>
          <div className="grid gap-2">
            <span className="text-[0.75rem] font-medium text-ink-soft">
              {dict.search.status}
            </span>
            <Listbox
              label={dict.search.status}
              options={statusOptions(dict)}
              value={query.status ?? ""}
              onChange={(v) =>
                setQuery((p) => ({ ...p, status: v as ListingStatus | "" }))
              }
              align="end"
            />
          </div>
        </div>

        <Button type="submit" className="mt-1 w-full">
          {dict.search.submit}
        </Button>
      </div>
    </form>
  );
}
