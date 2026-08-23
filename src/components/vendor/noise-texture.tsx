"use client";

/**
 * Vendored from componentry.dev (`@componentry/noise-texture`), then adapted.
 *
 * Three changes from the original, all of them load-bearing here:
 *
 *  1. The `transform: scale()` is gone. The original drew into a small buffer
 *     and then scaled the canvas element up by 2 or 3 with
 *     `transformOrigin: top left`, which paints well outside the element box
 *     and relies entirely on an ancestor to clip it. A scaled canvas that
 *     nothing clips covers the rest of the page. The small buffer is now
 *     stretched to the element by the browser instead, which gives the same
 *     chunky grain with `image-rendering: pixelated` and cannot escape its box.
 *     A `clip-path: inset(0)` is kept as a second line of defence.
 *  2. `animate` defaults to false, and is ignored under reduced motion. The
 *     original repaints the whole canvas on a timer forever, which is a
 *     continuous GPU cost for a texture nobody is looking at.
 *  3. The resize listener became a ResizeObserver on the canvas itself, so it
 *     tracks its own box rather than the window.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NoiseTextureProps {
  className?: string;
  opacity?: number;
  speed?: number;
  grain?: "fine" | "medium" | "coarse";
  blend?: "overlay" | "soft-light" | "multiply" | "screen" | "normal";
  animate?: boolean;
}

const GRAIN_SIZES: Record<string, number> = { fine: 1, medium: 2, coarse: 3 };

export function NoiseTexture({
  className,
  opacity = 0.4,
  speed = 10,
  grain = "medium",
  blend = "normal",
  animate = false,
}: NoiseTextureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grainSize = GRAIN_SIZES[grain] ?? 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // A deliberately small buffer: the browser stretches it to the element
      // box, and `image-rendering: pixelated` keeps the grain crisp.
      canvas.width = Math.max(1, Math.ceil(rect.width / grainSize));
      canvas.height = Math.max(1, Math.ceil(rect.height / grainSize));
      render();
    };

    const render = () => {
      const { width, height } = canvas;
      if (width === 0 || height === 0) return;
      const image = ctx.createImageData(width, height);
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (animate && !reduced) {
      const tick = () => {
        render();
        timer.current = setTimeout(() => {
          frame.current = requestAnimationFrame(tick);
        }, 1000 / speed);
      };
      tick();
    }

    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
      cancelAnimationFrame(frame.current);
    };
  }, [grain, speed, animate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity,
        mixBlendMode: blend,
        imageRendering: "pixelated",
        width: "100%",
        height: "100%",
        clipPath: "inset(0)",
      }}
    />
  );
}
