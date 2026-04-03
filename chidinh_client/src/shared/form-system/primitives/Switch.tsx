import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from "react";

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "role"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const switchClassName = [
  "inline-flex",
  "h-7",
  "w-12",
  "items-center",
  "rounded-[var(--radius-md)]",
  "border-2",
  "border-[var(--border)]",
  "bg-[var(--input)]",
  "px-1",
  "shadow-[var(--shadow-crisp-sm)]",
  "transition-transform",
  "duration-150",
  "hover:translate-x-[1px]",
  "hover:translate-y-[1px]",
  "focus-visible:outline-none",
  "focus-visible:shadow-[var(--focus-ring)]",
  "data-[checked=true]:border-[var(--primary)]",
  "data-[checked=true]:bg-[var(--primary)]",
  "disabled:cursor-not-allowed",
  "disabled:bg-[var(--form-state-disabled-bg)]",
  "disabled:opacity-70",
  "disabled:shadow-none",
  "disabled:hover:translate-x-0",
  "disabled:hover:translate-y-0",
].join(" ");

const thumbClassName = [
  "block",
  "h-4",
  "w-4",
  "rounded-[calc(var(--radius-sm)-1px)]",
  "bg-[var(--card)]",
  "shadow-[var(--shadow-crisp-sm)]",
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
