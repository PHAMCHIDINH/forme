import { TaskPriority, TaskStatus } from "./taskTypes";

export type TaskFormState = {
  title: string;
  descriptionHtml: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueOn: string;
  tags: string[];
};

export const DEFAULT_FORM_STATE: TaskFormState = {
  title: "",
  descriptionHtml: "",
  status: "todo",
  priority: "medium",
  dueOn: "",
  tags: [],
};
