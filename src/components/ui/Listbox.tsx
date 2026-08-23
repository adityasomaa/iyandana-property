"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { CaretDown, Check } from "@phosphor-icons/react/dist/ssr";
import { useOverlayLock } from "@/components/providers/SiteProviders";

export type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  /** Shown when `value` matches no option. */
  placeholder?: string;
  name?: string;
  /** Locks page scroll while open. Used by the language switcher. */
  lockScroll?: boolean;
  className?: string;
  /** Where the popup opens relative to the trigger. */
  align?: "start" | "end";
};

const TYPEAHEAD_RESET_MS = 600;

/**
 * A select-only combobox following the WAI-ARIA authoring practice.
 *
 * No native `<select>` anywhere on this site, so the control is styled to match
 * the rest of the form chrome. Focus never leaves the trigger: the active
 * option is tracked with `aria-activedescendant`, which means closing the
 * popup by any route already leaves focus in the right place.
 *
 * Keyboard: Up/Down move, Home/End jump, printable characters type ahead,
 * Enter and Space commit, Escape closes without changing the value, Tab closes
 * and moves on.
 */
export function Listbox({
  label,
  options,
  value,
  onChange,
  placeholder,
  name,
  lockScroll = false,
  className = "",
  align = "start",
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });

  const baseId = useId();
  const listId = `${baseId}-list`;
  const labelId = `${baseId}-label`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value],
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useOverlayLock(`listbox-${baseId}`, lockScroll && open);

  const openList = useCallback(
    (startAt?: number) => {
      setActiveIndex(startAt ?? (selectedIndex >= 0 ? selectedIndex : 0));
      setOpen(true);
    },
    [selectedIndex],
  );

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (option) onChange(option.value);
      setOpen(false);
    },
    [options, onChange],
  );

  // Keep the active option in view as it moves, without scrolling the page.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `#${CSS.escape(optionId(activeIndex))}`,
    );
    el?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // Pointer down outside closes, and focus is already on the trigger.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;

    if (key === "Tab") {
      setOpen(false);
      return;
    }

    if (key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
      return;
    }

    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const delta = key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) =>
        Math.min(options.length - 1, Math.max(0, i + delta)),
      );
      return;
    }

    if (key === "Home" || key === "End") {
      event.preventDefault();
      const target = key === "Home" ? 0 : options.length - 1;
      if (!open) openList(target);
      else setActiveIndex(target);
      return;
    }

    if (key === "Enter" || key === " " || key === "Spacebar") {
      event.preventDefault();
      if (open) commit(activeIndex);
      else openList();
      return;
    }

    // Type-ahead. Single printable characters only, so modifier combinations
    // and shortcuts pass straight through.
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const state = typeahead.current;
      state.buffer =
        now - state.at > TYPEAHEAD_RESET_MS ? key : state.buffer + key;
      state.at = now;

      const needle = state.buffer.toLowerCase();
      // Repeating one character cycles through the options starting with it.
      const cycling =
        state.buffer.length > 1 && new Set(state.buffer.toLowerCase()).size === 1;
      const from = cycling ? activeIndex + 1 : 0;
      const order = options.map((_, i) => (from + i) % options.length);
      const hit = order.find((i) =>
        options[i].label
          .toLowerCase()
          .startsWith(cycling ? needle[0] : needle),
      );

      if (hit !== undefined) {
        event.preventDefault();
        if (open) setActiveIndex(hit);
        else commit(hit);
      }
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span id={labelId} className="visually-clipped">
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-controls={listId}
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? setOpen(false) : openList())}
        className="field-shell flex h-11 w-full cursor-pointer items-center justify-between gap-3 px-3 text-left text-sm"
      >
        <span className={selected ? "text-ink" : "text-ink-faint"}>
          {selected?.label ?? placeholder ?? label}
        </span>
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden
          className={`shrink-0 text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          className={`absolute top-[calc(100%+0.25rem)] z-[var(--z-filter-panel)] max-h-64 w-full min-w-max overflow-y-auto overscroll-contain border border-control bg-surface py-1 shadow-[0_18px_44px_-18px_rgba(20,32,27,0.45)] ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            const isActive = i === activeIndex;
            return (
              <li
                key={option.value}
                id={optionId(i)}
                role="option"
                aria-selected={isSelected}
                onPointerDown={(e) => {
                  e.preventDefault();
                  commit(i);
                }}
                onPointerMove={() => setActiveIndex(i)}
                className={`flex cursor-pointer items-center justify-between gap-4 px-3 py-2 text-sm ${
                  isActive ? "bg-jade text-on-jade" : "text-ink"
                }`}
              >
                <span>{option.label}</span>
                {isSelected ? (
                  <Check size={13} weight="bold" aria-hidden className="shrink-0" />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
