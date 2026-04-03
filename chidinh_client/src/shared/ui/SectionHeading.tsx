type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="max-w-4xl space-y-3">
      <p className="inline-block border-2 border-border bg-secondary px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-secondary-foreground shadow-[var(--shadow-crisp-sm)]">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl uppercase leading-none text-foreground lg:text-5xl">{title}</h2>
      <p className="max-w-2xl text-sm font-medium leading-7 text-foreground/80 lg:text-base">{description}</p>
    </header>
  );
}
