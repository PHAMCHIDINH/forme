import { forwardRef, type TextareaHTMLAttributes } from "react";

import { getFieldShellClassName } from "./InputShell";

export type TextareaShellProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextareaShell = forwardRef<HTMLTextAreaElement, TextareaShellProps>(
  function TextareaShell({ className, disabled, readOnly, ...props }, ref) {
    return (
      <textarea
        className={getFieldShellClassName({ readOnly, disabled }, "min-h-28 resize-y align-top", className)}
        disabled={disabled}
        readOnly={readOnly}
        ref={ref}
        {...props}
      />
    );
  },
);
