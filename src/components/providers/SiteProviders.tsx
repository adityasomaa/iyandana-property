"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/site";

/* ------------------------------------------------------------------ locale */

const LocaleContext = createContext<Locale>("id");

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/* ----------------------------------------------------------------- overlay
 * One place knows how many blocking surfaces are open: the mobile menu, the
 * filter panel, the gallery lightbox, the language listbox. Body scroll is
 * locked while the count is above zero and released exactly once when it
 * returns to zero, so two overlays closing cannot leave the page stuck.
 * Smooth scrolling reads the same count and stands down while any is open.
 * -------------------------------------------------------------------------- */

type OverlayApi = {
  count: number;
  open: (id: string) => void;
  close: (id: string) => void;
};

const OverlayContext = createContext<OverlayApi>({
  count: 0,
  open: () => {},
  close: () => {},
});

export function useOverlayCount(): number {
  return useContext(OverlayContext).count;
}

/**
 * Registers a blocking overlay for as long as `isOpen` is true, and cleans up
 * on unmount even if the component disappears while still open.
 */
export function useOverlayLock(id: string, isOpen: boolean): void {
  const { open, close } = useContext(OverlayContext);
  useEffect(() => {
    if (!isOpen) return;
    open(id);
    return () => close(id);
  }, [id, isOpen, open, close]);
}

function OverlayProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const scrollbarPad = useRef<string>("");

  const open = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const close = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const count = ids.length;

  useEffect(() => {
    const body = document.body;
    if (count > 0) {
      if (body.dataset.scrollLocked !== "true") {
        const gap = window.innerWidth - document.documentElement.clientWidth;
        scrollbarPad.current = body.style.paddingRight;
        if (gap > 0) body.style.paddingRight = `${gap}px`;
        body.dataset.scrollLocked = "true";
      }
    } else if (body.dataset.scrollLocked === "true") {
      delete body.dataset.scrollLocked;
      body.style.paddingRight = scrollbarPad.current;
    }
  }, [count]);

  // A hard release on unmount, so a navigation mid-overlay cannot strand the
  // page in a locked state.
  useEffect(() => {
    return () => {
      delete document.body.dataset.scrollLocked;
      document.body.style.paddingRight = "";
    };
  }, []);

  const value = useMemo(() => ({ count, open, close }), [count, open, close]);

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
}

/* ------------------------------------------------------------------- root */

export function SiteProviders({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>
      <OverlayProvider>{children}</OverlayProvider>
    </LocaleContext.Provider>
  );
}
