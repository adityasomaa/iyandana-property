"use client";

import { usePathname } from "next/navigation";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { useLocale } from "@/components/providers/SiteProviders";
import { buildWhatsAppUrl, type WhatsAppContext } from "@/lib/whatsapp";
import { buttonClass } from "./Button";

type Props = {
  /**
   * Stable slug identifying which button this is, e.g. "hero", "listing-card",
   * "detail-sticky", "footer-cta". It travels in the message so an enquiry can
   * be traced to the exact control that produced it.
   */
  source: string;
  children: React.ReactNode;
  context?: WhatsAppContext;
  variant?: "solid" | "outline" | "quiet";
  className?: string;
  /** Hides the icon where the button is very narrow. */
  showIcon?: boolean;
};

/**
 * The only way this site links to WhatsApp.
 *
 * It reads the current page path itself, so no caller can forget to include it
 * and no two buttons can disagree about where they are. The listing title and
 * code, when supplied, go into the same message.
 */
export function WhatsAppLink({
  source,
  children,
  context,
  variant = "solid",
  className = "",
  showIcon = true,
}: Props) {
  const locale = useLocale();
  // Pathname only, deliberately. Reading the query string here would need
  // useSearchParams, which opts every page that renders a WhatsApp button out
  // of static prerendering. The path already identifies the page.
  const pathname = usePathname();
  const href = buildWhatsAppUrl({ locale, source, pathname, context });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-wa-source={source}
      className={buttonClass(variant, className)}
    >
      {showIcon ? <WhatsappLogo size={16} weight="fill" aria-hidden /> : null}
      {children}
    </a>
  );
}
