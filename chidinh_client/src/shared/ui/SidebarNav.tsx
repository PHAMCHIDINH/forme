import { NavLink } from "react-router-dom";

import { Button } from "./Button";
import { Panel } from "./Panel";

type NavItem = {
  label: string;
  to: string;
  end?: boolean;
};

type Props = {
  ariaLabel: string;
  items: NavItem[];
  operatorName: string;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function SidebarNav({ ariaLabel, items, operatorName, onLogout, isLoggingOut }: Props) {
  return (
    <Panel
      className="flex h-fit min-h-[calc(100vh-3rem)] flex-col gap-5 bg-secondary p-5 shadow-[var(--shadow-crisp-md)] lg:shadow-[var(--shadow-crisp-lg)]"
      variant="shell"
    >
      <div className="space-y-2 border-b-2 border-border pb-4">
        <p className="inline-block border-2 border-border bg-card px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-foreground shadow-[var(--shadow-crisp-sm)]">
          Private Hub
        </p>
        <h1 className="font-display text-[1.9rem] uppercase leading-none text-foreground">Workspace</h1>
      </div>

      <nav aria-label={ariaLabel} className="flex flex-col gap-3">
        {items.map((item) => (
          <NavLink
            key={`${item.label}-${item.to}`}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "group rounded-[var(--radius-md)] border-2 px-3 py-3 text-sm font-black uppercase tracking-[0.08em] shadow-[var(--shadow-crisp-sm)] transition-transform focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
                isActive
                  ? "border-border bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t-2 border-border pt-4">
        <p className="truncate text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground" title={operatorName}>
          {operatorName}
        </p>
        <Button
          className="w-full"
          variant="secondary"
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          pending={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </Panel>
  );
}
