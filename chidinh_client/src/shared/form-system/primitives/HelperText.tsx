import type { HTMLAttributes } from "react";

type HelperTextProps = Omit<HTMLAttributes<HTMLParagraphElement>, "aria-live" | "data-tone" | "role"> & {
  "aria-live"?: never;
  "data-tone"?: never;
  role?: never;
};

export function HelperText({ className, ...props }: HelperTextProps) {
  return (
    <p
      {...props}
      className={[
        "text-xs font-medium leading-5 tracking-[0.04em] text-muted-foreground",
        className,
      ].filter(Boolean).join(" ")}
      aria-live="polite"
      data-tone="default"
      role="status"
    />
  );
}
