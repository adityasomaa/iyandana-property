"use client";

import { useId } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Listbox, type Option } from "@/components/ui/Listbox";
import { PriceInput } from "@/components/ui/PriceInput";
import type { Dict } from "@/lib/dictionary";
import type { Query } from "@/lib/listings";
import type { PropertyType, ListingStatus } from "@/data/types";

export type FieldsProps = {
  dict: Dict;
  locations: string[];
  value: Query;
  onChange: (patch: Partial<Query>) => void;
  /** Hides the sort control where it does not belong, e.g. the hero. */
  showSort?: boolean;
};

export function typeOptions(dict: Dict): Option[] {
  return [
    { value: "", label: dict.search.anyType },
    { value: "rumah", label: dict.types.rumah },
    { value: "villa", label: dict.types.villa },
    { value: "tanah", label: dict.types.tanah },
    { value: "hotel", label: dict.types.hotel },
    { value: "komersial", label: dict.types.komersial },
  ];
}

export function statusOptions(dict: Dict): Option[] {
  return [
    { value: "", label: dict.search.anyStatus },
    { value: "dijual", label: dict.status.dijual },
    { value: "disewa", label: dict.status.disewa },
  ];
}

export function locationOptions(dict: Dict, locations: string[]): Option[] {
  return [
    { value: "", label: dict.search.anyLocation },
    ...locations.map((l) => ({ value: l, label: l })),
  ];
}

export function sortOptions(dict: Dict): Option[] {
  return [
    { value: "default", label: dict.search.sortNewest },
    { value: "price-asc", label: dict.search.sortPriceAsc },
    { value: "price-desc", label: dict.search.sortPriceDesc },
  ];
}

/** The keyword box, split out because the hero and the panel place it apart. */
export function KeywordField({
  dict,
  value,
  onChange,
}: {
  dict: Dict;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-[0.75rem] font-medium text-ink-soft">
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
          id={id}
          type="search"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={dict.search.keywordPlaceholder}
          className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
      </div>
    </div>
  );
}

/** Type, status, location, price range, and optionally sort. */
export function FilterFields({
  dict,
  locations,
  value,
  onChange,
  showSort = false,
}: FieldsProps) {
  const labelled = (label: string, node: React.ReactNode) => (
    <div className="grid gap-2">
      <span className="text-[0.75rem] font-medium text-ink-soft">{label}</span>
      {node}
    </div>
  );

  return (
    <>
      {labelled(
        dict.search.type,
        <Listbox
          label={dict.search.type}
          options={typeOptions(dict)}
          value={value.type ?? ""}
          onChange={(v) => onChange({ type: v as PropertyType | "" })}
        />,
      )}

      {labelled(
        dict.search.status,
        <Listbox
          label={dict.search.status}
          options={statusOptions(dict)}
          value={value.status ?? ""}
          onChange={(v) => onChange({ status: v as ListingStatus | "" })}
        />,
      )}

      {labelled(
        dict.search.location,
        <Listbox
          label={dict.search.location}
          options={locationOptions(dict, locations)}
          value={value.location ?? ""}
          onChange={(v) => onChange({ location: v })}
        />,
      )}

      <PriceInput
        label={dict.search.priceMin}
        value={value.min ?? null}
        onChange={(min) => onChange({ min })}
      />
      <PriceInput
        label={dict.search.priceMax}
        value={value.max ?? null}
        onChange={(max) => onChange({ max })}
      />

      {showSort
        ? labelled(
            dict.search.sort,
            <Listbox
              label={dict.search.sort}
              options={sortOptions(dict)}
              value={value.sort ?? "default"}
              onChange={(v) => onChange({ sort: v as Query["sort"] })}
            />,
          )
        : null}
    </>
  );
}
