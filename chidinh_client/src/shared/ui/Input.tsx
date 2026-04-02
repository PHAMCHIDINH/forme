import { cva } from "class-variance-authority";
import { forwardRef } from "react";

const inputVariants = cva(
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", ...props },
  ref,
) {
  return <input className={inputVariants({ className })} ref={ref} {...props} />;
});
