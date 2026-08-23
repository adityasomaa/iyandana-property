"use client";

import { useId } from "react";
import { groupDigits, ungroupDigits } from "@/lib/format";
import { useLocale } from "@/components/providers/SiteProviders";

/**
 * A price field that shows grouped thousands while typing and hands the caller
 * a raw number. The grouped string never reaches the filtering maths, and the
 * raw number never reaches the screen.
 */
export function PriceInput({
  label,
  value,
  onChange,
  name,
}: {
  label: string;
  /** Raw number, or null for empty. */
  value: number | null;
  onChange: (next: number | null) => void;
  name?: string;
}) {
  const locale = useLocale();
  const id = useId();
  const display = value == null ? "" : groupDigits(String(value), locale);

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-[0.75rem] font-medium text-ink-soft">
        {label}
      </label>
      <div className="field-shell flex h-11 items-center gap-2 px-3 focus-within:border-jade">
        <span aria-hidden className="text-[0.8125rem] text-ink-faint">
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          onChange={(e) => onChange(ungroupDigits(e.target.value))}
          className="h-full w-full min-w-0 bg-transparent text-sm outline-none [font-variant-numeric:tabular-nums]"
          placeholder="0"
        />
      </div>
      {name ? (
        <input type="hidden" name={name} value={value == null ? "" : value} />
      ) : null}
    </div>
  );
}
