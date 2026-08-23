"use client";

import { useActionState, useState } from "react";
import { usePathname } from "next/navigation";
import { WhatsappLogo, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr";

import {
  submitConsign,
  submitConstruction,
  type FormState,
} from "@/app/actions/enquiry";
import { Button } from "@/components/ui/Button";
import { buttonClass } from "@/components/ui/Button";
import { Listbox } from "@/components/ui/Listbox";
import { typeOptions } from "@/components/listing/FilterFields";
import { TextField, TextArea, FieldShell, Honeypot } from "./Field";
import type { Dict } from "@/lib/dictionary";
import type { Locale } from "@/lib/site";
import type { PropertyType } from "@/data/types";

const EMPTY: FormState = { ok: false };

/**
 * Both enquiry forms.
 *
 * Submission runs through a server action that re-checks every field, so the
 * client validation is a convenience rather than the gate. On success the
 * action hands back a WhatsApp URL, and the visitor decides whether to open it.
 * Nothing is stored anywhere.
 */
export function EnquiryForm({
  kind,
  dict,
  locale,
}: {
  kind: "consign" | "construction";
  dict: Dict;
  locale: Locale;
}) {
  const pathname = usePathname();
  const action = kind === "consign" ? submitConsign : submitConstruction;
  const [state, formAction, pending] = useActionState(action, EMPTY);
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");

  const err = (field: string) => state.errors?.[field];

  if (state.ok && state.url) {
    return (
      <div className="border border-jade bg-surface p-8">
        <h3 className="text-lg">{dict.forms.successTitle}</h3>
        <p className="mt-3 max-w-[52ch] text-[0.875rem] leading-relaxed text-ink-soft">
          {dict.forms.successBody}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={state.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("solid")}
          >
            <WhatsappLogo size={16} weight="fill" aria-hidden />
            {dict.forms.openWhatsApp}
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={buttonClass("outline")}
          >
            <ArrowCounterClockwise size={14} weight="bold" aria-hidden />
            {dict.forms.editAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="pathname" value={pathname} />
      <Honeypot />

      {state.formError ? (
        <p
          role="alert"
          className="border-l-[3px] border-sale-fg bg-surface py-3 pl-4 pr-4 text-[0.8125rem] text-sale-fg"
        >
          {state.formError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label={dict.forms.name}
          name="name"
          required
          requiredLabel={dict.common.required}
          optionalLabel={dict.common.optional}
          error={err("name")}
        />
        <TextField
          label={dict.forms.phone}
          name="phone"
          type="tel"
          inputMode="tel"
          required
          requiredLabel={dict.common.required}
          optionalLabel={dict.common.optional}
          error={err("phone")}
        />
      </div>

      <TextField
        label={dict.forms.email}
        name="email"
        type="email"
        inputMode="email"
        requiredLabel={dict.common.required}
        optionalLabel={dict.common.optional}
        error={err("email")}
      />

      {kind === "consign" ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell
              label={dict.forms.propertyType}
              name="propertyType"
              required
              requiredLabel={dict.common.required}
              optionalLabel={dict.common.optional}
              error={err("propertyType")}
            >
              <Listbox
                label={dict.forms.propertyType}
                options={typeOptions(dict).filter((o) => o.value !== "")}
                value={propertyType}
                onChange={(v) => setPropertyType(v as PropertyType)}
                placeholder={dict.search.anyType}
                name="propertyType"
              />
            </FieldShell>
            <TextField
              label={dict.forms.location}
              name="location"
              required
              requiredLabel={dict.common.required}
              optionalLabel={dict.common.optional}
              error={err("location")}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <TextField
              label={dict.forms.landArea}
              name="landArea"
              inputMode="numeric"
              requiredLabel={dict.common.required}
              optionalLabel={dict.common.optional}
              error={err("landArea")}
            />
            <TextField
              label={dict.forms.buildingArea}
              name="buildingArea"
              inputMode="numeric"
              requiredLabel={dict.common.required}
              optionalLabel={dict.common.optional}
              error={err("buildingArea")}
            />
            <TextField
              label={dict.forms.askingPrice}
              name="askingPrice"
              inputMode="numeric"
              requiredLabel={dict.common.required}
              optionalLabel={dict.common.optional}
              error={err("askingPrice")}
            />
          </div>
        </>
      ) : (
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            label={dict.forms.workType}
            name="workType"
            required
            requiredLabel={dict.common.required}
            optionalLabel={dict.common.optional}
            error={err("workType")}
          />
          <TextField
            label={dict.forms.projectLocation}
            name="projectLocation"
            required
            requiredLabel={dict.common.required}
            optionalLabel={dict.common.optional}
            error={err("projectLocation")}
          />
          <TextField
            label={dict.forms.budget}
            name="budget"
            inputMode="numeric"
            requiredLabel={dict.common.required}
            optionalLabel={dict.common.optional}
            error={err("budget")}
          />
        </div>
      )}

      <TextArea
        label={dict.forms.message}
        name="message"
        required
        rows={6}
        requiredLabel={dict.common.required}
        optionalLabel={dict.common.optional}
        error={err("message")}
        placeholder={
          kind === "consign"
            ? dict.forms.messagePlaceholderConsign
            : dict.forms.messagePlaceholderConstruction
        }
      />

      <p className="text-[0.75rem] leading-relaxed text-ink-faint">
        {dict.forms.reviewBody}
      </p>

      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? dict.forms.submitting : dict.common.send}
      </Button>
    </form>
  );
}
