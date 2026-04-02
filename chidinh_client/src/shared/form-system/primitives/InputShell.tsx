import { forwardRef, type InputHTMLAttributes } from "react";

const fieldShellBaseClassName = [
  "w-full",
  "rounded-[var(--radius-md)]",
  "border",
  "border-[var(--border-default)]",
  "bg-[var(--surface-panel)]",
  "px-4",
  "py-3",
  "text-sm",
  "text-foreground",
  "outline-none",
  "transition-colors",
  "duration-150",
  "placeholder:text-muted",
  "hover:border-[var(--border-strong)]",
  "focus-visible:border-primary",
  "focus-visible:outline-none",
  "focus-visible:shadow-[var(--focus-ring)]",
  "disabled:cursor-not-allowed",
  "disabled:bg-[var(--form-state-disabled-bg)]",
  "disabled:text-muted-foreground",
  "data-[state=error]:border-[var(--form-state-error-border)]",
  "data-[state=warning]:border-[var(--form-state-warning-border)]",
  "data-[state=success]:border-[var(--form-state-success-border)]",
  "aria-[invalid=true]:border-[var(--form-state-error-border)]",
].join(" ");

export function getFieldShellClassName(...classNames: Array<string | undefined>) {
  return [fieldShellBaseClassName, ...classNames].filter(Boolean).join(" ");
}

export type InputShellProps = InputHTMLAttributes<HTMLInputElement>;

export const InputShell = forwardRef<HTMLInputElement, InputShellProps>(function InputShell(
  { className, ...props },
  ref,
) {
  return <input className={getFieldShellClassName(className)} ref={ref} {...props} />;
});
