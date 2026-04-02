import type { HTMLAttributes, ReactNode } from "react";

type ActionAreaProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  primary?: ReactNode;
  secondary?: ReactNode;
};

export function ActionArea({ className, primary, secondary, ...props }: ActionAreaProps) {
  if (!primary && !secondary) {
    return null;
  }

  return (
    <div
      className={[
        "flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-slot="action-area"
      data-testid="action-area"
      {...props}
    >
      <div
        className="flex flex-wrap items-center gap-3"
        data-slot="action-area-secondary"
        data-testid="action-area-secondary"
      >
        {secondary}
      </div>
      <div
        className="flex flex-wrap items-center justify-end gap-3"
        data-slot="action-area-primary"
        data-testid="action-area-primary"
      >
        {primary}
      </div>
    </div>
  );
}
