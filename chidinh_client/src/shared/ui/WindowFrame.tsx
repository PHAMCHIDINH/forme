import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  className?: string;
  contentClassName?: string;
}>;

export function WindowFrame({
  title,
  subtitle,
  toolbar,
  className = "",
  contentClassName = "",
  children,
}: Props) {
  return (
    <section
      className={`flex flex-col rounded-[var(--radius-lg)] border-2 border-border bg-card shadow-[var(--shadow-crisp-lg)] ${className}`.trim()}
    >
      <header className="flex items-center justify-between border-b-2 border-border bg-primary px-4 py-3">
        <div aria-label="Window controls" className="flex items-center gap-2">
          <div aria-hidden="true" className="h-3 w-3 border-2 border-border bg-card shadow-[var(--shadow-crisp-sm)]" />
          <div aria-hidden="true" className="h-3 w-3 border-2 border-border bg-card shadow-[var(--shadow-crisp-sm)]" />
        </div>

        <div className="min-w-0 flex-1 px-4 text-center">
          <p className="font-head text-sm uppercase tracking-wider text-primary-foreground">{title}</p>
          {subtitle ? <p className="mt-1 text-xs font-medium text-primary-foreground/80">{subtitle}</p> : null}
        </div>

        <div className="flex min-w-[3rem] justify-end">{toolbar}</div>
      </header>

      <div className={`p-5 ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
}
