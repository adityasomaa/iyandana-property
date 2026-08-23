"use server";

import { z } from "zod";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getDictionary } from "@/lib/dictionary";
import { LOCALES, type Locale } from "@/lib/site";
import { PROPERTY_TYPES } from "@/data/types";

/**
 * Server-side validation for both enquiry forms.
 *
 * The browser checks the same rules for immediate feedback, but nothing is
 * trusted until it has been through this: a form posted with scripting off, or
 * with the client checks bypassed, still gets validated here before any message
 * is assembled.
 *
 * No enquiry is stored. The action returns a wa.me URL and the visitor sends
 * the message themselves.
 */

export type FormState = {
  ok: boolean;
  url?: string;
  formError?: string;
  errors?: Record<string, string>;
};

const trimmed = z.string().trim();

const phoneRule = trimmed
  .min(6, "errorPhone")
  .max(24, "errorPhone")
  .regex(/^[+]?[\d][\d\s().-]{4,}$/, "errorPhone");

const baseShape = {
  locale: z.enum(LOCALES),
  pathname: trimmed.min(1).max(300),
  name: trimmed.min(2, "errorTooShort").max(80, "errorTooLong"),
  phone: phoneRule,
  email: z.union([z.literal(""), trimmed.email("errorEmail").max(120, "errorTooLong")]),
  message: trimmed.min(10, "errorTooShort").max(1200, "errorTooLong"),
  // Bots fill every field they find. A human never sees this one.
  company: z.literal("", { message: "errorGeneric" }),
};

const optionalNumber = z.union([
  z.literal(""),
  trimmed.regex(/^\d{1,15}$/, "errorNumber"),
]);

const consignSchema = z.object({
  ...baseShape,
  propertyType: z.enum(PROPERTY_TYPES, { message: "errorRequired" }),
  location: trimmed.min(2, "errorTooShort").max(120, "errorTooLong"),
  landArea: optionalNumber,
  buildingArea: optionalNumber,
  askingPrice: optionalNumber,
});

const constructionSchema = z.object({
  ...baseShape,
  workType: trimmed.min(2, "errorTooShort").max(120, "errorTooLong"),
  projectLocation: trimmed.min(2, "errorTooShort").max(120, "errorTooLong"),
  budget: optionalNumber,
});

function read(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

/** Maps a message key from the schema onto the visitor's language. */
function localise(locale: Locale, key: string): string {
  const forms = getDictionary(locale).forms as unknown as Record<string, string>;
  return forms[key] ?? forms.errorGeneric;
}

function collect(
  locale: Locale,
  issues: z.core.$ZodIssue[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    if (!errors[field]) {
      const key =
        issue.code === "invalid_type" || issue.message === "Required"
          ? "errorRequired"
          : issue.message;
      errors[field] = localise(locale, key);
    }
  }
  return errors;
}

function money(value: string, locale: Locale): string {
  if (!value) return "";
  return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US").format(
    Number(value),
  );
}

export async function submitConsign(
  _previous: FormState,
  data: FormData,
): Promise<FormState> {
  const parsed = consignSchema.safeParse({
    locale: read(data, "locale"),
    pathname: read(data, "pathname"),
    name: read(data, "name"),
    phone: read(data, "phone"),
    email: read(data, "email"),
    message: read(data, "message"),
    company: read(data, "company"),
    propertyType: read(data, "propertyType"),
    location: read(data, "location"),
    landArea: read(data, "landArea"),
    buildingArea: read(data, "buildingArea"),
    askingPrice: read(data, "askingPrice"),
  });

  const locale = (LOCALES as readonly string[]).includes(read(data, "locale"))
    ? (read(data, "locale") as Locale)
    : "id";

  if (!parsed.success) {
    return {
      ok: false,
      formError: localise(locale, "errorGeneric"),
      errors: collect(locale, parsed.error.issues),
    };
  }

  const v = parsed.data;
  const dict = getDictionary(v.locale);
  const lines = [
    `${dict.forms.name}: ${v.name}`,
    `${dict.forms.phone}: ${v.phone}`,
    v.email ? `${dict.forms.email}: ${v.email}` : "",
    `${dict.forms.propertyType}: ${dict.types[v.propertyType]}`,
    `${dict.forms.location}: ${v.location}`,
    v.landArea ? `${dict.forms.landArea}: ${money(v.landArea, v.locale)}` : "",
    v.buildingArea
      ? `${dict.forms.buildingArea}: ${money(v.buildingArea, v.locale)}`
      : "",
    v.askingPrice
      ? `${dict.forms.askingPrice}: ${money(v.askingPrice, v.locale)}`
      : "",
    "",
    `${dict.forms.message}: ${v.message}`,
  ].filter(Boolean);

  return {
    ok: true,
    url: buildWhatsAppUrl({
      locale: v.locale,
      source: "consign-form",
      pathname: v.pathname,
      context: { lines },
    }),
  };
}

export async function submitConstruction(
  _previous: FormState,
  data: FormData,
): Promise<FormState> {
  const parsed = constructionSchema.safeParse({
    locale: read(data, "locale"),
    pathname: read(data, "pathname"),
    name: read(data, "name"),
    phone: read(data, "phone"),
    email: read(data, "email"),
    message: read(data, "message"),
    company: read(data, "company"),
    workType: read(data, "workType"),
    projectLocation: read(data, "projectLocation"),
    budget: read(data, "budget"),
  });

  const locale = (LOCALES as readonly string[]).includes(read(data, "locale"))
    ? (read(data, "locale") as Locale)
    : "id";

  if (!parsed.success) {
    return {
      ok: false,
      formError: localise(locale, "errorGeneric"),
      errors: collect(locale, parsed.error.issues),
    };
  }

  const v = parsed.data;
  const dict = getDictionary(v.locale);
  const lines = [
    `${dict.forms.name}: ${v.name}`,
    `${dict.forms.phone}: ${v.phone}`,
    v.email ? `${dict.forms.email}: ${v.email}` : "",
    `${dict.forms.workType}: ${v.workType}`,
    `${dict.forms.projectLocation}: ${v.projectLocation}`,
    v.budget ? `${dict.forms.budget}: ${money(v.budget, v.locale)}` : "",
    "",
    `${dict.forms.message}: ${v.message}`,
  ].filter(Boolean);

  return {
    ok: true,
    url: buildWhatsAppUrl({
      locale: v.locale,
      source: "construction-form",
      pathname: v.pathname,
      context: { lines },
    }),
  };
}
