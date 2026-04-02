import { useMemo, useState } from "react";

import { Button } from "../../shared/ui/Button";
import { ContextToolbar } from "../../shared/ui/ContextToolbar";
import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";

type ModuleCard = {
  title: string;
  state: "live" | "planned";
  description: string;
  metric: string;
};

const MODULES: ModuleCard[] = [
  {
    title: "Todo",
    state: "live",
    description: "Track current execution items and short-term delivery tasks.",
    metric: "4 active today",
  },
  {
    title: "Files",
    state: "planned",
    description: "Reserve space for asset organization and operational references.",
    metric: "0 linked collections",
  },
  {
    title: "Automation",
    state: "planned",
    description: "Prepare the shell for recurring workflows and assistant-driven tasks.",
    metric: "No automations configured",
  },
];

export function DashboardHomePage() {
  const [scope, setScope] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [syncPending, setSyncPending] = useState(false);
  const [moduleDeck, setModuleDeck] = useState("cards");

  const visibleModules = useMemo(() => {
    return MODULES.filter((module) => {
      const scopeMatch =
        scope === "all"
          ? true
          : scope === "active"
            ? module.state === "live"
            : module.state === "planned";
      const filterMatch = statusFilter === "all" ? true : module.state === statusFilter;
      const searchMatch =
        query.trim().length === 0
          ? true
          : `${module.title} ${module.description}`.toLowerCase().includes(query.trim().toLowerCase());

      return scopeMatch && filterMatch && searchMatch;
    });
  }, [query, scope, statusFilter]);

  const handleSync = () => {
    setSyncPending(true);
    window.setTimeout(() => {
      setSyncPending(false);
    }, 900);
  };

  const handleReset = () => {
    setScope("all");
    setStatusFilter("all");
    setQuery("");
  };

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Workspace"
        title="Workspace Overview"
        description="A summary-first operating surface with shared context and action grammar for modules."
      />

      <ContextToolbar
        ariaLabel="Overview context toolbar"
        scopeOptions={[
          { value: "all", label: "All Modules" },
          { value: "active", label: "Live Now" },
          { value: "planned", label: "Planned Next-Cycle Surfaces" },
        ]}
        selectedScope={scope}
        onScopeChange={setScope}
        filterLabel="Module state"
        filters={[
          { value: "all", label: "Any state" },
          { value: "live", label: "Live state" },
          { value: "planned", label: "Planned state" },
        ]}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        searchValue={query}
        searchPlaceholder="Search module summaries"
        onSearchChange={setQuery}
        secondaryActions={[
          {
            label: "Reset",
            onClick: handleReset,
            disabled: scope === "all" && statusFilter === "all" && query.trim().length === 0,
          },
          {
            label: "Export",
            onClick: () => undefined,
            disabled: visibleModules.length === 0,
          },
        ]}
        primaryAction={{
          label: syncPending ? "Syncing..." : "Sync Overview",
          onClick: handleSync,
          pending: syncPending,
          disabled: syncPending,
        }}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2" variant="featured">
          <p className="text-xs uppercase tracking-[0.16em] text-accent">Featured summary</p>
          <h3 className="mt-2 font-display text-2xl text-foreground">Overview Health</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            One featured card is used to anchor the page. Remaining module cards stay neutral to preserve
            scanability.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" disabled>
              Secondary Disabled
            </Button>
            <Button size="sm">Primary Action</Button>
          </div>
        </Panel>

        <Panel className="p-5" variant="muted">
          <p className="text-sm text-muted-foreground">Signals</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{visibleModules.length}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Modules in current scope</p>
        </Panel>
      </div>

      {visibleModules.length === 0 ? (
        <Panel className="space-y-2 p-5" variant="muted">
          <p className="text-sm font-semibold text-foreground">No modules match this context</p>
          <p className="text-sm text-muted-foreground">
            This empty state is intentional for ugly-state validation of the overview pattern.
          </p>
          <Button size="sm" variant="secondary" onClick={handleReset}>
            Clear Filters
          </Button>
        </Panel>
      ) : (
        <div className="space-y-3">
          <ContextToolbar
            ariaLabel="Module deck toolbar"
            scopeOptions={[
              { value: "cards", label: "Card Deck" },
              { value: "signals", label: "Signal Focus" },
            ]}
            selectedScope={moduleDeck}
            onScopeChange={setModuleDeck}
            secondaryActions={[
              {
                label: "Collapse",
                onClick: () => setModuleDeck("signals"),
                disabled: moduleDeck === "signals",
              },
            ]}
            primaryAction={{
              label: "Review Modules",
              onClick: () => undefined,
            }}
          />

          <div className="grid gap-3 lg:grid-cols-3">
          {visibleModules.map((module) => (
            <Panel
              className="p-5"
              key={module.title}
              variant={module.state === "planned" ? "muted" : "default"}
            >
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {module.state === "live" ? "Live Module" : "Planned Module"}
              </p>
              <h3 className="mt-2 text-xl font-display text-foreground">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
              <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-muted-foreground">
                {module.metric}
              </p>
            </Panel>
          ))}
          </div>
        </div>
      )}
    </section>
  );
}
