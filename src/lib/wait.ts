/**
 * Waits `ms`, resolving on whichever of the frame loop or the timer gets there
 * first.
 *
 * A sequence driven only by requestAnimationFrame stalls the moment the tab
 * goes to the background, and a page-transition curtain that stalls mid-close
 * stays closed forever. A sequence driven only by a timer drifts away from what
 * the compositor is actually showing. Racing the two keeps the animation tied
 * to real frames while guaranteeing the step still completes in a hidden tab.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };

    const timer = window.setTimeout(finish, ms);

    const start = performance.now();
    const tick = (now: number) => {
      if (settled) return;
      if (now - start >= ms) finish();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
