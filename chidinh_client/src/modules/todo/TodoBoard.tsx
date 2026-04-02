import { Panel } from "../../shared/ui/Panel";
import { TaskItem, TaskStatus } from "./taskTypes";

type TodoBoardProps = {
  boardGroups: Record<TaskStatus, TaskItem[]>;
  statusLabels: Record<TaskStatus, string>;
  formatDueAt: (iso: string | null) => string | null;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (item: TaskItem) => void;
  onToggleArchive: (item: TaskItem) => void;
};

export function TodoBoard({
  boardGroups,
  statusLabels,
  formatDueAt,
  onStatusChange,
  onEdit,
  onToggleArchive,
}: TodoBoardProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {(Object.keys(boardGroups) as TaskStatus[]).map((status) => (
        <Panel className="p-4" key={status}>
          <p className="text-sm font-medium text-text">
            {statusLabels[status]} ({boardGroups[status].length})
          </p>
          <div className="mt-3 space-y-3">
            {boardGroups[status].map((todo) => (
              <div className="rounded border border-border bg-surface p-3" key={todo.id}>
                <p className="text-sm font-medium text-text">{todo.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {todo.priority}
                  {todo.dueAt ? ` · due ${formatDueAt(todo.dueAt)}` : ""}
                </p>
                {todo.tags.length > 0 ? (
                  <p className="mt-1 text-xs text-muted">#{todo.tags.join(" #")}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <select
                    aria-label={`Board status for ${todo.title}`}
                    value={todo.status}
                    onChange={(event) => onStatusChange(todo.id, event.target.value as TaskStatus)}
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    className="rounded border border-border px-2 py-1 text-xs"
                    type="button"
                    onClick={() => onEdit(todo)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded border border-border px-2 py-1 text-xs"
                    type="button"
                    onClick={() => onToggleArchive(todo)}
                  >
                    {todo.archivedAt ? "Unarchive" : "Archive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
