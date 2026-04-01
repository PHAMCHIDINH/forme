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
    <section className={`border-2 border-border bg-card shadow-md flex flex-col ${className}`.trim()}>
      <header className="border-b-2 border-border bg-primary px-4 py-3 flex items-center justify-between">
        <div aria-label="Window controls" className="flex items-center gap-2">
          <div aria-hidden="true" className="h-3 w-3 bg-card border-2 border-border" />
          <div aria-hidden="true" className="h-3 w-3 bg-card border-2 border-border" />
        </div>

        <div className="min-w-0 flex-1 px-4 text-center">
          <p className="font-head text-primary-foreground text-sm tracking-wider uppercase">{title}</p>
          {subtitle ? <p className="text-xs font-medium text-primary-foreground/80 mt-1">{subtitle}</p> : null}
        </div>

        <div className="flex min-w-[3rem] justify-end">{toolbar}</div>
      </header>

      <div className={`p-5 ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
}
