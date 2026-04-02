import { Panel } from "../../shared/ui/Panel";
import { TaskListView } from "./taskTypes";

export type LayoutMode = "list" | "board";

type TodoToolbarProps = {
  view: TaskListView;
  searchInput: string;
  layout: LayoutMode;
  onViewChange: (value: TaskListView) => void;
  onSearchChange: (value: string) => void;
  onLayoutChange: (value: LayoutMode) => void;
};

export function TodoToolbar({
  view,
  searchInput,
  layout,
  onViewChange,
  onSearchChange,
  onLayoutChange,
}: TodoToolbarProps) {
  return (
    <Panel className="p-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="todo-view">View</label>
          <select
            id="todo-view"
            value={view}
            onChange={(event) => onViewChange(event.target.value as TaskListView)}
          >
            <option value="active">All active</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="todo-search">Search</label>
          <input
            id="todo-search"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title, description, tags"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="todo-layout">Layout</label>
          <select
            id="todo-layout"
            value={layout}
            onChange={(event) => onLayoutChange(event.target.value as LayoutMode)}
          >
            <option value="list">List</option>
            <option value="board">Board</option>
          </select>
        </div>
      </div>
    </Panel>
  );
}
