import { NavLink } from "react-router-dom";

type DockItem = {
  label: string;
  to: string;
  end?: boolean;
};

type Props = {
  ariaLabel: string;
  items: DockItem[];
};

export function DockNav({ ariaLabel, items }: Props) {
  return (
    <nav aria-label={ariaLabel} className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 border-2 border-black bg-card p-2 shadow-md z-50 overflow-x-auto max-w-[95vw]">
      {items.map((item) => (
        <NavLink
          key={`${item.label}-${item.to}`}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `font-head px-4 py-2 uppercase text-xs sm:text-sm tracking-wide border-2 transition-all ${
              isActive
                ? "bg-primary text-primary-foreground border-border shadow-[2px_2px_0_0_#000] transform -translate-y-1"
                : "text-foreground border-transparent hover:bg-muted hover:border-border"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
