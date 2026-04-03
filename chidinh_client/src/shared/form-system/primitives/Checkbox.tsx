import { forwardRef, type InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const checkboxClassName = [
  "h-5",
  "w-5",
  "rounded-[calc(var(--radius-sm)-1px)]",
  "border-2",
  "border-[var(--border)]",
  "bg-[var(--input)]",
  "text-primary",
  "accent-[var(--primary)]",
  "shadow-[var(--shadow-crisp-sm)]",
  "transition-transform",
  "duration-150",
  "hover:translate-x-[1px]",
  "hover:translate-y-[1px]",
  "focus-visible:outline-none",
  "focus-visible:shadow-[var(--focus-ring)]",
  "aria-[invalid=true]:border-[var(--destructive)]",
  "disabled:cursor-not-allowed",
  "disabled:bg-[var(--form-state-disabled-bg)]",
  "disabled:shadow-none",
  "disabled:hover:translate-x-0",
  "disabled:hover:translate-y-0",
].join(" ");

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return <input className={[checkboxClassName, className].filter(Boolean).join(" ")} ref={ref} type="checkbox" {...props} />;
});
