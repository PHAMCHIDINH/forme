import type { HTMLAttributes, ReactNode } from "react";

type FormSectionProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  actions?: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  header?: ReactNode;
  headingId?: string;
};

export function FormSection({
  actions,
  body,
  children,
  className,
  header,
  headingId,
  ...props
}: FormSectionProps) {
  const resolvedBody = body ?? children;

  return (
    <section
      className={[
        "space-y-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-panel)] p-6 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
      data-slot="form-section"
      {...props}
    >
      {header ? <div data-slot="form-section-header">{header}</div> : null}
      {resolvedBody ? <div data-slot="form-section-body">{resolvedBody}</div> : null}
      {actions ? <div data-slot="form-section-actions">{actions}</div> : null}
    </section>
  );
}
