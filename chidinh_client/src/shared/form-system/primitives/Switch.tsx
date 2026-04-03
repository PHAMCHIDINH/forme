import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from "react";

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "role"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const switchClassName = [
  "inline-flex",
  "h-6",
  "w-11",
  "items-center",
  "rounded-full",
  "border",
  "border-[var(--border-default)]",
  "bg-[var(--surface-panel-muted)]",
  "px-0.5",
  "transition-colors",
  "duration-150",
  "focus-visible:outline-none",
  "focus-visible:shadow-[var(--focus-ring)]",
  "data-[checked=true]:border-[var(--border-strong)]",
  "data-[checked=true]:bg-primary",
  "disabled:cursor-not-allowed",
  "disabled:bg-[var(--form-state-disabled-bg)]",
  "disabled:opacity-70",
].join(" ");

const thumbClassName = [
  "block",
  "h-4",
  "w-4",
  "rounded-full",
  "bg-[var(--surface-panel)]",
  "shadow-sm",
  "transition-transform",
  "duration-150",
  "data-[checked=true]:translate-x-5",
].join(" ");

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked = false, className, disabled, onCheckedChange, onClick, ...props },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    onCheckedChange?.(!checked);
  };

  return (
    <button
      aria-checked={checked}
      className={[switchClassName, className].filter(Boolean).join(" ")}
      data-checked={checked ? "true" : "false"}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      role="switch"
      type="button"
      {...props}
    >
      <span aria-hidden="true" className={thumbClassName} data-checked={checked ? "true" : "false"} />
    </button>
  );
});
