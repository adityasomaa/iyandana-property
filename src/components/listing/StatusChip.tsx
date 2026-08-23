import type { ListingStatus } from "@/data/types";
import type { Dict } from "@/lib/dictionary";

/**
 * Status is never carried by colour alone. The chip prints the status word,
 * and the word is prefixed by its own label so it reads correctly out of
 * context and to a screen reader.
 */
export function StatusChip({
  status,
  dict,
  size = "sm",
}: {
  status: ListingStatus;
  dict: Dict;
  size?: "sm" | "md";
}) {
  const tone =
    status === "dijual"
      ? "bg-sale-bg text-sale-fg"
      : "bg-rent-bg text-rent-fg";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] font-medium tracking-[0.02em] ${tone} ${
        size === "sm" ? "px-2 py-1 text-[0.6875rem]" : "px-2.5 py-1.5 text-xs"
      }`}
    >
      <span className="opacity-70">{dict.status.label}</span>
      <span aria-hidden className="opacity-40">
        /
      </span>
      {dict.status[status]}
    </span>
  );
}

/** The sample marker. Shown on every card and detail page while the data file
 *  still holds sample listings. */
export function SampleChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-[2px] border border-dashed border-control px-2 py-1 text-[0.6875rem] font-medium tracking-[0.02em] text-ink-soft">
      {label}
    </span>
  );
}
