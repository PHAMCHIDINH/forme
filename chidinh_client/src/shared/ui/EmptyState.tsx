import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className = "" }: EmptyStateProps) {
  return (
    <section className={`space-y-3 text-center ${className}`.trim()}>
      <h2 className="font-display text-2xl text-text">{title}</h2>
      <p className="mx-auto max-w-xl text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </section>
  );
}
