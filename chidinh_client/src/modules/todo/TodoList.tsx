import { Panel } from "../../shared/ui/Panel";
import { TaskItem, TaskStatus } from "./taskTypes";

type TodoListProps = {
  items: TaskItem[];
  formatDueAt: (iso: string | null) => string | null;
  sanitizeRichText: (value: string) => string;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (item: TaskItem) => void;
  onToggleArchive: (item: TaskItem) => void;
  onDelete: (id: string) => void;
};

export function TodoList({
  items,
  formatDueAt,
  sanitizeRichText,
  onStatusChange,
  onEdit,
  onToggleArchive,
  onDelete,
}: TodoListProps) {
  return (
    <div className="space-y-3">
      {items.map((todo) => (
        <Panel className="space-y-3 p-5" key={todo.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-text">{todo.title}</p>
              <p className="mt-1 text-xs text-muted">
                {todo.status} · {todo.priority}
                {todo.dueAt ? ` · due ${formatDueAt(todo.dueAt)}` : ""}
                {todo.tags.length > 0 ? ` · #${todo.tags.join(" #")}` : ""}
              </p>
            </div>
            <select
              aria-label={`Status for ${todo.title}`}
              value={todo.status}
              onChange={(event) => onStatusChange(todo.id, event.target.value as TaskStatus)}
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {todo.descriptionHtml ? (
            <div
              className="text-sm text-text"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(todo.descriptionHtml) }}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
              type="button"
              onClick={() => onEdit(todo)}
            >
              Edit
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
              type="button"
              onClick={() => onToggleArchive(todo)}
            >
              {todo.archivedAt ? "Unarchive" : "Archive"}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
              type="button"
              onClick={() => onDelete(todo.id)}
            >
              Delete
            </button>
          </div>
        </Panel>
      ))}
    </div>
  );
}
