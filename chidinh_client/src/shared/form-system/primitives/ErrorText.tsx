import type { HTMLAttributes } from "react";

type ErrorTextProps = Omit<HTMLAttributes<HTMLParagraphElement>, "aria-live" | "data-tone" | "role"> & {
  "aria-live"?: never;
  "data-tone"?: never;
  role?: never;
};

export function ErrorText({ className, ...props }: ErrorTextProps) {
  return (
    <p
      {...props}
      className={[
        "text-xs font-black uppercase leading-5 tracking-[0.08em] text-[var(--destructive)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="assertive"
      data-tone="error"
      role="alert"
    />
  );
}
