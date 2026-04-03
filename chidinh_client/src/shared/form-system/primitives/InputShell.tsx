import { forwardRef, type InputHTMLAttributes } from "react";

const fieldShellBaseClassName = [
  "w-full",
  "rounded-[var(--radius-md)]",
  "border-2",
  "border-[var(--border)]",
  "bg-[var(--input)]",
  "px-4",
  "py-3",
  "text-sm",
  "font-medium",
  "text-foreground",
  "shadow-[var(--shadow-crisp-sm)]",
  "outline-none",
  "transition-transform",
  "duration-150",
  "placeholder:text-foreground/50",
  "hover:translate-x-[1px]",
  "hover:translate-y-[1px]",
  "focus-visible:shadow-[var(--focus-ring)]",
  "data-[state=error]:border-[var(--form-state-error-border)]",
  "data-[state=warning]:border-[var(--form-state-warning-border)]",
  "data-[state=success]:border-[var(--form-state-success-border)]",
  "aria-[invalid=true]:border-[var(--destructive)]",
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
          stateOrClassName.readOnly && "read-only:shadow-none",
          stateOrClassName.readOnly && "read-only:hover:translate-x-0",
          stateOrClassName.readOnly && "read-only:hover:translate-y-0",
          stateOrClassName.disabled && "disabled:cursor-not-allowed",
          stateOrClassName.disabled && "disabled:bg-[var(--form-state-disabled-bg)]",
          stateOrClassName.disabled && "disabled:text-muted-foreground",
          stateOrClassName.disabled && "disabled:shadow-none",
          stateOrClassName.disabled && "disabled:hover:translate-x-0",
          stateOrClassName.disabled && "disabled:hover:translate-y-0",
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
