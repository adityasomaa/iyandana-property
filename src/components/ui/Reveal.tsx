"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Reveals its children as they scroll into view, using IntersectionObserver.
 *
 * Two things this deliberately does not do:
 *  - It never attaches a scroll listener.
 *  - It never arms an element that is already on screen at mount, so
 *    above-the-fold content is not hidden for a frame and then faded in.
 *
 * In development it walks the ancestor chain and warns if a parent clips
 * overflow, because an observer inside a clipped parent reports a ratio of 0
 * forever and the reveal silently never runs.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "article";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    // Already visible: leave it alone.
    if (rect.top < window.innerHeight * 0.92) return;
    setArmed(true);
  }, []);

  useEffect(() => {
    if (!armed) return;
    const el = ref.current;
    if (!el) return;

    if (process.env.NODE_ENV !== "production") {
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const { overflow, overflowY } = getComputedStyle(parent);
        if (/hidden|clip/.test(overflow) || /hidden|clip/.test(overflowY)) {
          console.warn(
            "[Reveal] an ancestor clips overflow; the observer will never fire.",
            parent,
          );
          break;
        }
        parent = parent.parentElement;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);

    // If anything goes wrong, show the content rather than hide it forever.
    const failsafe = window.setTimeout(() => setShown(true), 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [armed]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`${armed ? "reveal" : ""} ${className}`}
      data-shown={armed ? String(shown) : undefined}
      style={armed && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
