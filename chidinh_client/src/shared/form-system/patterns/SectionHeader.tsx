import type { HTMLAttributes } from "react";

type SectionHeaderProps = HTMLAttributes<HTMLElement> & {
  description?: string;
  headingId?: string;
  title: string;
};

export function SectionHeader({
  className,
  description,
  headingId,
  title,
  ...props
}: SectionHeaderProps) {
  return (
    <header
      className={["space-y-2", className].filter(Boolean).join(" ")}
      data-slot="section-header"
      {...props}
    >
      <h2 className="text-xl font-semibold text-foreground" id={headingId}>
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
