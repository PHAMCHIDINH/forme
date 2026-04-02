type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="max-w-3xl space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 className="font-display text-3xl text-foreground lg:text-[2rem]">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground lg:text-base">{description}</p>
    </header>
  );
}
