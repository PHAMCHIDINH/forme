import { forwardRef, type InputHTMLAttributes } from "react";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const radioClassName = [
  "h-5",
  "w-5",
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

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, ...props },
  ref,
) {
  return <input className={[radioClassName, className].filter(Boolean).join(" ")} ref={ref} type="radio" {...props} />;
});
