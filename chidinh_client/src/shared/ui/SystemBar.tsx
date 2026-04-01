type Props = {
  productLabel: string;
  contextLabel: string;
  indicators?: string[];
};

export function SystemBar({ productLabel, contextLabel, indicators = [] }: Props) {
  return (
    <div className="system-bar">
      <div>
        <p className="system-bar__product">{productLabel}</p>
        <p className="system-bar__context">{contextLabel}</p>
      </div>

      <div className="system-bar__indicators">
        {indicators.map((indicator) => (
          <span className="system-pill" key={indicator}>
            {indicator}
          </span>
        ))}
      </div>
    </div>
  );
}
