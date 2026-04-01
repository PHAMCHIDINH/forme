type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-text">{title}</h2>
      <p className="max-w-2xl text-base leading-7 text-muted">{description}</p>
    </header>
  );
}
