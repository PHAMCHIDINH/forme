import { Panel } from "../../shared/ui/Panel";

type TodoMetricsProps = {
  total: number;
  open: number;
  completed: number;
};

export function TodoMetrics({ total, open, completed }: TodoMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Panel className="p-5">
        <p className="text-sm text-muted">Tasks</p>
        <p className="mt-3 text-xl font-display text-text">{total} total</p>
      </Panel>
      <Panel className="p-5">
        <p className="text-sm text-muted">Open</p>
        <p className="mt-3 text-xl font-display text-text">{open} open</p>
      </Panel>
      <Panel className="p-5">
        <p className="text-sm text-muted">Completed</p>
        <p className="mt-3 text-xl font-display text-text">{completed} complete</p>
      </Panel>
    </div>
  );
}
