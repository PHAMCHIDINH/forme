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
    <Panel className="flex h-fit min-h-[calc(100vh-3rem)] flex-col p-5" variant="shell">
      <div className="space-y-1 border-b border-[var(--border-subtle)] pb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">Private Hub</p>
        <h1 className="font-display text-[1.6rem] text-foreground">Workspace</h1>
      </div>

      <nav aria-label={ariaLabel} className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <NavLink
            key={`${item.label}-${item.to}`}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group rounded-[var(--radius-md)] border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ${
                isActive
                  ? "border-[var(--border-strong)] bg-[var(--surface-panel-featured)] text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:border-[var(--border-default)] hover:bg-[var(--surface-panel)] hover:text-foreground"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-[var(--border-subtle)] pt-4">
        <p className="truncate text-sm text-muted-foreground" title={operatorName}>
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
