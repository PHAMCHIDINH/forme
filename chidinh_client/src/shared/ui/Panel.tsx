import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-[28px] border border-border bg-surface shadow-panel ${className}`.trim()}
    >
      {children}
    </div>
  );
}
