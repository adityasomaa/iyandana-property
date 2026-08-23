import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

type Variant = "solid" | "outline" | "quiet";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] px-5 py-3 text-[0.8125rem] font-medium tracking-[0.02em] transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-expo)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55";

const VARIANTS: Record<Variant, string> = {
  // 6.9:1 against paper, 6.9:1 for its own label. Verified by audit:contrast.
  solid: "bg-jade text-on-jade hover:bg-jade-deep",
  outline: "border border-control text-ink hover:border-jade hover:text-jade",
  quiet: "text-jade underline underline-offset-4 hover:text-jade-deep",
};

export function buttonClass(variant: Variant = "solid", extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`;
}

export function ButtonLink({
  variant = "solid",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, className)} {...props}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "solid",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={buttonClass(variant, className)} {...props}>
      {children}
    </button>
  );
}
