type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="max-w-2xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
      <h2 className="font-display text-3xl text-text">{title}</h2>
      <p className="text-base leading-7 text-muted">{description}</p>
    </header>
  );
}
