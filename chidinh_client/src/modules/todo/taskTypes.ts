export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type TaskPriority = "low" | "medium" | "high";

export type TaskListView = "active" | "today" | "upcoming" | "overdue" | "completed" | "archived";

export type TaskItem = {
  id: string;
  title: string;
  descriptionHtml: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  tags: string[];
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListTodosParams = {
  view?: TaskListView;
  q?: string;
  status?: TaskStatus;
  tag?: string;
};

export type CreateTaskInput = {
  title: string;
  descriptionHtml?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string;
  tags?: string[];
  archivedAt?: string;
};

export type UpdateTaskInput = {
  title?: string;
  descriptionHtml?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string | null;
  tags?: string[] | null;
  archivedAt?: string | null;
};
