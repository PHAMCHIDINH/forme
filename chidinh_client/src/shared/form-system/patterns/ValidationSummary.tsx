import type { HTMLAttributes } from "react";

export type ValidationSummaryError = {
  fieldId: string;
  message: string;
};

type ValidationSummaryProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  errors: ValidationSummaryError[];
  title?: string;
};

export function ValidationSummary({
  className,
  errors,
  title,
  ...props
}: ValidationSummaryProps) {
  if (errors.length === 0) {
    return null;
  }

  const resolvedTitle = title ?? `Please fix the following ${errors.length} ${errors.length === 1 ? "field" : "fields"}:`;

  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border border-[var(--form-state-error-border)] bg-[var(--surface-panel)] px-5 py-4 text-[var(--form-state-error-text)] shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-slot="validation-summary"
      role="alert"
      {...props}
    >
      <p className="text-sm font-semibold">{resolvedTitle}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {errors.map((error) => (
          <li key={`${error.fieldId}:${error.message}`}>
            <a
              className="font-medium underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
              href={`#${error.fieldId}`}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
