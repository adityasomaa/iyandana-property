import type { ElementType } from "react";

/**
 * Splits a heading into per-letter spans for the entrance animation.
 *
 * The whole string is announced once from the wrapper's `aria-label`; every
 * letter span is `aria-hidden`, so assistive technology reads the sentence
 * rather than spelling it out. Words stay whole `inline-block` units so the
 * line never breaks in the middle of one.
 *
 * The animation is pure CSS with an index-driven delay, and it starts from an
 * already-visible baseline: if the animation never runs the text is still there.
 */
export function SplitText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  step = 16,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** Milliseconds before the first letter moves. */
  delay?: number;
  /** Milliseconds between letters. */
  step?: number;
}) {
  const words = text.split(" ");
  let index = 0;

  return (
    <Tag aria-label={text} className={`split-text ${className}`}>
      {words.map((word, w) => {
        const letters = [...word];
        const node = (
          <span
            key={`${word}-${w}`}
            aria-hidden
            // Each letter is its own inline-block, so without this the word
            // itself wraps between letters at narrow widths.
            className="inline-block whitespace-nowrap"
          >
            {letters.map((letter, l) => {
              const i = index++;
              return (
                <span
                  key={`${letter}-${l}`}
                  className="split-letter inline-block"
                  style={{ animationDelay: `${delay + i * step}ms` }}
                >
                  {letter}
                </span>
              );
            })}
          </span>
        );
        index += 1; // the space between words keeps the cadence even
        return w < words.length - 1 ? (
          <span key={`w-${w}`}>
            {node}
            <span aria-hidden> </span>
          </span>
        ) : (
          node
        );
      })}
    </Tag>
  );
}
