"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useOverlayCount } from "@/components/providers/SiteProviders";

/**
 * Smooth scrolling, on desktop only.
 *
 * Lenis takes over the wheel, which is right on a pointer-driven desktop and
 * wrong everywhere else: on touch it fights the platform's own inertia, and it
 * hijacks the scroll of any panel layered over the page. So it runs only at
 * fine-pointer desktop widths, and it stops the moment a filter panel, mobile
 * menu, language list or lightbox is open, resuming when they close.
 */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const overlays = useOverlayCount();

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    let frame = 0;

    const start = () => {
      if (lenis.current) return;
      const instance = new Lenis({
        duration: 1.05,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        // Touch is left entirely to the platform.
        syncTouch: false,
        touchMultiplier: 0,
      });
      lenis.current = instance;
      document.documentElement.classList.add("lenis-active");
      const raf = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      lenis.current?.destroy();
      lenis.current = null;
      document.documentElement.classList.remove("lenis-active");
    };

    const sync = () => (media.matches ? start() : stop());
    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
      stop();
    };
  }, []);

  // Any blocking surface pauses the wheel takeover so the panel scrolls itself.
  useEffect(() => {
    const instance = lenis.current;
    if (!instance) return;
    if (overlays > 0) instance.stop();
    else instance.start();
  }, [overlays]);

  return null;
}
