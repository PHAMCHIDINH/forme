type Props = {
  productLabel: string;
  contextLabel: string;
  indicators?: string[];
};

export function SystemBar({ productLabel, contextLabel, indicators = [] }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-4 border-border bg-card shadow-md p-4 mb-8 relative">
      <div>
        <h1 className="font-head text-2xl lg:text-3xl font-black uppercase text-foreground tracking-tighter">{productLabel}</h1>
        <p className="text-muted-foreground font-bold uppercase mt-1 tracking-widest text-xs lg:text-sm">{contextLabel}</p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {indicators.map((indicator) => (
          <span className="border-2 border-border bg-accent text-accent-foreground px-3 py-1 text-xs font-bold shadow-sm whitespace-nowrap" key={indicator}>
            {indicator}
          </span>
        ))}
      </div>
    </div>
  );
}
