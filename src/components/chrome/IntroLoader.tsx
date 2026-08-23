"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";
import { NoiseTexture } from "@/components/vendor/noise-texture";

export const INTRO_MS = 1150;

/**
 * The loader for a full page load.
 *
 * It is present in the very first paint and leaves on its own with a CSS
 * animation, so there is never a flash of content followed by a cover, and it
 * still clears with JavaScript disabled. The effect component below only
 * unmounts the node once it is already off screen.
 *
 * It is not a promotional interstitial. Nothing here asks for anything, nothing
 * waits for a dismissal, and it is gone in about a second.
 */
export function IntroLoader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Failsafe: if the animation never runs, take the cover away anyway.
    const t = window.setTimeout(() => setGone(true), INTRO_MS + 600);
    return () => window.clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div aria-hidden className="intro-loader" data-intro-loader>
      <NoiseTexture opacity={0.05} grain="medium" blend="multiply" />
      <div className="intro-loader__inner">
        <Wordmark className="intro-loader__mark text-ink" />
        <span className="intro-loader__rule" />
      </div>
    </div>
  );
}
