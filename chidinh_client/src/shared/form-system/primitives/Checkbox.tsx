import { forwardRef, type InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const checkboxClassName = [
  "h-5",
  "w-5",
  "rounded-[calc(var(--radius-sm)-1px)]",
  "border",
  "border-[var(--border-default)]",
  "bg-[var(--surface-panel)]",
  "text-primary",
  "accent-[var(--primary)]",
  "focus-visible:outline-none",
  "focus-visible:shadow-[var(--focus-ring)]",
  "disabled:cursor-not-allowed",
  "disabled:bg-[var(--form-state-disabled-bg)]",
].join(" ");

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return <input className={[checkboxClassName, className].filter(Boolean).join(" ")} ref={ref} type="checkbox" {...props} />;
});
