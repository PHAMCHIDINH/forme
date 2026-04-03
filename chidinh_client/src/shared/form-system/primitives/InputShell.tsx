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
  "data-[state=error]:border-[var(--form-state-error-border)]",
  "data-[state=warning]:border-[var(--form-state-warning-border)]",
  "data-[state=success]:border-[var(--form-state-success-border)]",
  "aria-[invalid=true]:border-[var(--form-state-error-border)]",
].join(" ");

type FieldShellState = {
  readOnly?: boolean;
  disabled?: boolean;
};

export function getFieldShellClassName(
  stateOrClassName?: FieldShellState | string,
  ...classNames: Array<string | undefined>
) {
  const fieldStateClassNames =
    typeof stateOrClassName === "object" && stateOrClassName !== null
      ? [
          stateOrClassName.readOnly && "read-only:border-[var(--border-subtle)]",
          stateOrClassName.readOnly && "read-only:bg-[var(--surface-panel-muted)]",
          stateOrClassName.readOnly && "read-only:text-foreground",
          stateOrClassName.readOnly && "read-only:cursor-default",
          stateOrClassName.disabled && "disabled:cursor-not-allowed",
          stateOrClassName.disabled && "disabled:bg-[var(--form-state-disabled-bg)]",
          stateOrClassName.disabled && "disabled:text-muted-foreground",
        ]
      : [];

  const extraClassNames = typeof stateOrClassName === "string" ? [stateOrClassName, ...classNames] : classNames;

  return [fieldShellBaseClassName, ...fieldStateClassNames, ...extraClassNames].filter(Boolean).join(" ");
}

export type InputShellProps = InputHTMLAttributes<HTMLInputElement>;

export const InputShell = forwardRef<HTMLInputElement, InputShellProps>(function InputShell(
  { className, disabled, readOnly, ...props },
  ref,
) {
  return (
    <input
      className={getFieldShellClassName({ readOnly, disabled }, className)}
      disabled={disabled}
      readOnly={readOnly}
      ref={ref}
      {...props}
    />
  );
});
