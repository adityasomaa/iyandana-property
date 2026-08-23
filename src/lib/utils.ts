import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Class joiner used by the components vendored from componentry.dev. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
