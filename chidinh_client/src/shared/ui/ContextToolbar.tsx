import { Button } from "./Button";

type ScopeOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ToolbarAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
};

type ToolbarSecondaryAction = ToolbarAction & {
  kind?: "secondary" | "ghost";
};

type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  ariaLabel?: string;
  scopeOptions: ScopeOption[];
  selectedScope: string;
  onScopeChange: (scope: string) => void;
  filterLabel?: string;
  filters?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  secondaryActions?: ToolbarSecondaryAction[];
  primaryAction?: ToolbarAction;
};

export function ContextToolbar({
  ariaLabel,
  scopeOptions,
  selectedScope,
  onScopeChange,
  filterLabel,
  filters,
  selectedFilter,
  onFilterChange,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  secondaryActions,
  primaryAction,
}: Props) {
  return (
    <section
      aria-label={ariaLabel}
      className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-panel)] p-2"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {scopeOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            type="button"
            variant="scope"
            selected={selectedScope === option.value}
            disabled={option.disabled}
            onClick={() => onScopeChange(option.value)}
          >
            <span className="truncate">{option.label}</span>
          </Button>
        ))}

        {filters && filters.length > 0 && onFilterChange ? (
          <label className="min-w-[170px] text-xs text-muted-foreground sm:min-w-[200px]">
            <span className="sr-only">{filterLabel ?? "Filter"}</span>
            <select
              aria-label={filterLabel ?? "Filter"}
              className="h-9 w-full rounded-[var(--radius-md)] bg-[var(--surface-panel)] px-3 py-1.5 text-sm"
              value={selectedFilter}
              onChange={(event) => onFilterChange(event.target.value)}
            >
              {filters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {onSearchChange ? (
          <label className="min-w-[190px] text-xs text-muted-foreground sm:min-w-[230px]">
            <span className="sr-only">Search</span>
            <input
              aria-label="Search"
              className="h-9 w-full rounded-[var(--radius-md)] bg-[var(--surface-panel)] px-3 py-1.5 text-sm"
              placeholder={searchPlaceholder ?? "Search"}
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
        ) : null}
      </div>

      <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
        {secondaryActions?.map((action) => (
          <Button
            key={action.label}
            size="sm"
            type="button"
            variant={action.kind ?? "secondary"}
            disabled={action.disabled}
            pending={action.pending}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}

        {primaryAction ? (
          <Button
            size="sm"
            type="button"
            variant="primary"
            disabled={primaryAction.disabled}
            pending={primaryAction.pending}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
