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
    <nav aria-label={ariaLabel} className="desktop-dock">
      {items.map((item) => (
        <NavLink
          key={`${item.label}-${item.to}`}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `desktop-dock__item ${isActive ? "desktop-dock__item--active" : ""}`.trim()
          }
        >
          <span className="desktop-dock__icon" aria-hidden="true" />
          <span className="desktop-dock__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
