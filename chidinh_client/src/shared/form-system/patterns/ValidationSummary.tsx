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
        "rounded-[var(--radius-lg)] border-2 border-[var(--destructive)] bg-[var(--card)] px-5 py-4 text-[var(--destructive)] shadow-[var(--shadow-crisp-sm)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-slot="validation-summary"
      role="alert"
      {...props}
    >
      <p className="text-sm font-black uppercase tracking-[0.08em]">{resolvedTitle}</p>
      <ul className="mt-3 space-y-2 text-sm font-medium">
        {errors.map((error) => (
          <li key={`${error.fieldId}:${error.message}`}>
            <a
              className="underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
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
