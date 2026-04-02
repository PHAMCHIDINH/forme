import { forwardRef, type ButtonHTMLAttributes } from "react";

import { getFieldShellClassName } from "./InputShell";

export type SelectTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ className, type = "button", ...props }, ref) {
    return (
      <button
        className={getFieldShellClassName(
          "inline-flex items-center justify-between gap-3 text-left",
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
