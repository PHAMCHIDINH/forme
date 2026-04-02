import { forwardRef, type TextareaHTMLAttributes } from "react";

import { getFieldShellClassName } from "./InputShell";

export type TextareaShellProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextareaShell = forwardRef<HTMLTextAreaElement, TextareaShellProps>(
  function TextareaShell({ className, ...props }, ref) {
    return (
      <textarea
        className={getFieldShellClassName("min-h-28 resize-y", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
