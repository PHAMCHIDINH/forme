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
    <section className={`window-frame ${className}`.trim()}>
      <header className="window-frame__header">
        <div aria-label="Window controls" className="window-frame__traffic">
          <span className="window-frame__dot window-frame__dot--close" />
          <span className="window-frame__dot window-frame__dot--minimize" />
          <span className="window-frame__dot window-frame__dot--zoom" />
        </div>

        <div className="min-w-0 flex-1 text-center">
          <p className="window-frame__title">{title}</p>
          {subtitle ? <p className="window-frame__subtitle">{subtitle}</p> : null}
        </div>

        <div className="flex min-w-24 justify-end">{toolbar}</div>
      </header>

      <div className={`window-frame__body ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
}
