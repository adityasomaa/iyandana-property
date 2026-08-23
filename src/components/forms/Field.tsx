"use client";

import { useId } from "react";
import { Warning } from "@phosphor-icons/react/dist/ssr";

type Common = {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  requiredLabel?: string;
  hint?: string;
};

function Shell({
  id,
  label,
  error,
  required,
  optionalLabel,
  requiredLabel,
  hint,
  children,
}: Common & { id: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 text-[0.8125rem] font-medium text-ink-soft"
      >
        {label}
        <span className="text-[0.6875rem] font-normal text-ink-faint">
          {required ? requiredLabel : optionalLabel}
        </span>
      </label>

      {children}

      {hint ? (
        <p className="text-[0.75rem] leading-relaxed text-ink-faint">{hint}</p>
      ) : null}

      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-[0.75rem] text-sale-fg"
        >
          <Warning size={13} weight="fill" aria-hidden className="shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  type = "text",
  inputMode,
  placeholder,
  defaultValue,
  ...common
}: Common & {
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  placeholder?: string;
  defaultValue?: string;
}) {
  const id = useId();
  return (
    <Shell id={id} {...common}>
      <input
        id={id}
        name={common.name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={common.required}
        aria-invalid={common.error ? true : undefined}
        aria-describedby={common.error ? `${id}-error` : undefined}
        className={`field-shell h-11 w-full px-3 text-sm outline-none focus-visible:border-jade ${
          common.error ? "border-sale-fg" : ""
        }`}
      />
    </Shell>
  );
}

export function TextArea({
  placeholder,
  rows = 5,
  ...common
}: Common & { placeholder?: string; rows?: number }) {
  const id = useId();
  return (
    <Shell id={id} {...common}>
      <textarea
        id={id}
        name={common.name}
        rows={rows}
        placeholder={placeholder}
        required={common.required}
        aria-invalid={common.error ? true : undefined}
        aria-describedby={common.error ? `${id}-error` : undefined}
        className={`field-shell w-full resize-y px-3 py-2.5 text-sm leading-relaxed outline-none focus-visible:border-jade ${
          common.error ? "border-sale-fg" : ""
        }`}
      />
    </Shell>
  );
}

/**
 * Wraps a custom control, e.g. a Listbox, in the same label and error chrome.
 * The caption is a span, not a label: the control inside names itself through
 * `aria-labelledby`, and a `for` pointing at a composite widget would be wrong.
 */
export function FieldShell({
  children,
  label,
  error,
  required,
  optionalLabel,
  requiredLabel,
  hint,
}: Common & { children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <span className="flex items-baseline justify-between gap-3 text-[0.8125rem] font-medium text-ink-soft">
        {label}
        <span className="text-[0.6875rem] font-normal text-ink-faint">
          {required ? requiredLabel : optionalLabel}
        </span>
      </span>

      {children}

      {hint ? (
        <p className="text-[0.75rem] leading-relaxed text-ink-faint">{hint}</p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[0.75rem] text-sale-fg">
          <Warning size={13} weight="fill" aria-hidden className="shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The honeypot. Clipped rather than pushed off canvas: an element positioned
 * at a large negative offset with no positioned ancestor lands relative to the
 * viewport and drags a horizontal scrollbar onto every page it appears on.
 */
export function Honeypot() {
  return (
    <div className="visually-clipped" aria-hidden>
      <label htmlFor="company-field">Company</label>
      <input
        id="company-field"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
