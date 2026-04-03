type Props = {
  productLabel: string;
  contextLabel: string;
  indicators?: string[];
};

export function SystemBar({ productLabel, contextLabel, indicators = [] }: Props) {
  return (
    <div className="relative mb-8 flex flex-col items-start justify-between gap-4 border-4 border-border bg-card p-4 shadow-[var(--shadow-crisp-lg)] md:flex-row md:items-center">
      <div>
        <h1 className="font-head text-2xl font-black uppercase tracking-tighter text-foreground lg:text-3xl">{productLabel}</h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground lg:text-sm">{contextLabel}</p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {indicators.map((indicator) => (
          <span
            className="whitespace-nowrap border-2 border-border bg-accent px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-accent-foreground shadow-[var(--shadow-crisp-sm)]"
            key={indicator}
          >
            {indicator}
          </span>
        ))}
      </div>
    </div>
  );
}
