"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useOverlayLock } from "@/components/providers/SiteProviders";
import { tilePath } from "@/lib/format";
import { fill, type Dict } from "@/lib/dictionary";

/**
 * The listing gallery and its lightbox.
 *
 * The lightbox sits above every other page surface, locks page scroll while it
 * is open, releases it on close, and returns focus to the thumbnail that was
 * used to open it. Arrow keys move between panels; Escape closes.
 */
export function Gallery({
  code,
  views,
  typeLabel,
  dict,
}: {
  code: string;
  views: number;
  typeLabel: string;
  dict: Dict;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const openedFrom = useRef(0);

  useOverlayLock("gallery-lightbox", open);

  const alt = (i: number) =>
    fill(dict.detail.artworkAlt, { type: typeLabel.toLowerCase(), n: i + 1 });

  const move = useCallback(
    (delta: number) => setIndex((i) => (i + delta + views) % views),
    [views],
  );

  const close = useCallback(() => {
    setOpen(false);
    triggers.current[openedFrom.current]?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, move, close]);

  return (
    <>
      <div className="grid gap-3">
        <div className="relative overflow-hidden border border-hair bg-sunk">
          <button
            type="button"
            ref={(el) => {
              triggers.current[index] = el;
            }}
            onClick={() => {
              openedFrom.current = index;
              setOpen(true);
            }}
            className="block w-full cursor-zoom-in"
            aria-label={`${dict.detail.galleryHeading}: ${dict.common.image} ${index + 1} ${dict.common.of} ${views}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tilePath(code, index)}
              alt={alt(index)}
              width={1600}
              height={1200}
              className="aspect-[4/3] w-full object-cover"
            />
          </button>
        </div>

        {views > 1 ? (
          <ul className="grid grid-cols-4 gap-3">
            {Array.from({ length: views }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  ref={(el) => {
                    if (i !== index) triggers.current[i] = el;
                  }}
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={`block w-full overflow-hidden border transition-colors duration-200 ${
                    i === index ? "border-jade" : "border-hair hover:border-control"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tilePath(code, i)}
                    alt={`${dict.common.image} ${i + 1} ${dict.common.of} ${views}`}
                    width={1600}
                    height={1200}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[var(--z-lightbox)] bg-ink/92">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.detail.galleryHeading}
            tabIndex={-1}
            className="flex h-full w-full flex-col outline-none"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="text-[0.8125rem] text-on-ink [font-variant-numeric:tabular-nums]">
                {dict.common.image} {index + 1} {dict.common.of} {views}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label={dict.common.close}
                className="grid h-10 w-10 place-items-center border border-on-ink/35 text-on-ink transition-colors duration-200 hover:border-on-ink"
              >
                <X size={17} weight="bold" aria-hidden />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center gap-2 px-4 pb-6 sm:gap-4 sm:px-6">
              {views > 1 ? (
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label={dict.common.previous}
                  className="grid h-11 w-11 shrink-0 place-items-center border border-on-ink/35 text-on-ink transition-colors duration-200 hover:border-on-ink"
                >
                  <CaretLeft size={17} weight="bold" aria-hidden />
                </button>
              ) : null}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tilePath(code, index)}
                alt={alt(index)}
                width={1600}
                height={1200}
                className="mx-auto max-h-full min-h-0 w-auto max-w-full object-contain"
              />

              {views > 1 ? (
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label={dict.common.next}
                  className="grid h-11 w-11 shrink-0 place-items-center border border-on-ink/35 text-on-ink transition-colors duration-200 hover:border-on-ink"
                >
                  <CaretRight size={17} weight="bold" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
