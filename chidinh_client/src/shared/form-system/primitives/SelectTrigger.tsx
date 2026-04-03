import { forwardRef, type SelectHTMLAttributes } from "react";

import { getFieldShellClassName } from "./InputShell";

export type SelectTriggerProps = SelectHTMLAttributes<HTMLSelectElement>;

const selectTriggerAffordanceClassName =
  "appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.75'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")] bg-[position:right_0.875rem_center] bg-[size:0.75rem] bg-no-repeat pr-8";

export const SelectTrigger = forwardRef<HTMLSelectElement, SelectTriggerProps>(function SelectTrigger(
  { className, disabled, ...props },
  ref,
) {
    return (
      <select
        className={getFieldShellClassName({ disabled }, selectTriggerAffordanceClassName, className)}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  },
);
