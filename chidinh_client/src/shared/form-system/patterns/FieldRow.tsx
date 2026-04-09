import type { HTMLAttributes } from "react";

type FieldRowProps = HTMLAttributes<HTMLDivElement> & {
  columns?: 1 | 2;
  twoColumnClassName?: string;
};

export function FieldRow({
  className,
  columns = 1,
  twoColumnClassName = "md:grid-cols-2",
  ...props
}: FieldRowProps) {
  return (
    <div
      className={[
        "grid gap-5",
        columns === 2 ? twoColumnClassName : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-columns={String(columns)}
      data-slot="field-row"
      {...props}
    />
  );
}
