type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="space-y-4 border-l-8 border-primary pl-6 py-2 mb-8">
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h2 className="font-head text-4xl uppercase text-foreground">{title}</h2>
      <p className="max-w-2xl text-lg font-medium text-muted-foreground">{description}</p>
    </header>
  );
}
