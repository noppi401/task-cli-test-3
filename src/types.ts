export type TaskStatus = "pending" | "completed";

export type TaskFilter = "all" | TaskStatus;

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface TaskFile {
  tasks: Task[];
}
