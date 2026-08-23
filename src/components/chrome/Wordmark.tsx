/**
 * The typographic wordmark, set in the site's own face.
 *
 * The client's existing mark is a grayscale badge built around a currency
 * symbol. It ships here as the site icon, exactly as it stands, but the header
 * of a property site is not the place for it: it reads as a finance badge and
 * pulls attention toward the service this preview is trying to stop leading
 * with. See the README for the note to pass to the client.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline gap-[0.42em] leading-none ${className}`}
      style={{ fontSize: "0.9375rem" }}
    >
      <span className="font-medium tracking-[-0.02em]">IYANDANA</span>
      <span className="text-[0.72em] tracking-[0.2em] text-ink-soft">
        PROPERTY
      </span>
    </span>
  );
}
