import { promises as fs } from "node:fs";
import path from "node:path";
import type { Task, TaskFile, TaskFilter } from "./types.js";

const DEFAULT_DATA: TaskFile = { tasks: [] };

export class TaskStoreError extends Error {
  public constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "TaskStoreError";
  }
}

export class ValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class TaskStore {
  public constructor(private readonly filePath: string = path.resolve(process.cwd(), "tasks.json")) {}

  /** Returns tasks filtered by status, defaulting to all tasks. */
  public async listTasks(filter: TaskFilter = "all"): Promise<Task[]> {
    const data = await this.readData();
    if (filter === "all") {
      return data.tasks;
    }
    return data.tasks.filter((task: Task) => task.status === filter);
  }

  /** Creates a new pending task and persists it immediately. */
  public async addTask(title: string): Promise<Task> {
    const trimmedTitle: string = title.trim();
    if (trimmedTitle.length === 0) {
      throw new ValidationError("Task title must not be empty.");
    }

    const data = await this.readData();
    const nextId: number = data.tasks.reduce((maxId: number, task: Task) => Math.max(maxId, task.id), 0) + 1;
    const task: Task = {
      id: nextId,
      title: trimmedTitle,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    data.tasks.push(task);
    await this.writeData(data);
    return task;
  }

  /** Marks an existing task as completed and stores the completion timestamp. */
  public async completeTask(id: number): Promise<Task> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Task ID must be a positive integer.");
    }

    const data = await this.readData();
    const task = data.tasks.find((item: Task) => item.id === id);
    if (!task) {
      throw new ValidationError(`Task ${id} was not found.`);
    }

    task.status = "completed";
    task.completedAt = new Date().toISOString();
    await this.writeData(data);
    return task;
  }

  /** Deletes an existing task permanently. */
  public async deleteTask(id: number): Promise<Task> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Task ID must be a positive integer.");
    }

    const data = await this.readData();
    const index: number = data.tasks.findIndex((task: Task) => task.id === id);
    if (index === -1) {
      throw new ValidationError(`Task ${id} was not found.`);
    }

    const [deletedTask] = data.tasks.splice(index, 1);
    await this.writeData(data);
    return deletedTask;
  }

  private async readData(): Promise<TaskFile> {
    try {
      const content: string = await fs.readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(content);
      return this.validateData(parsed);
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return { ...DEFAULT_DATA, tasks: [] };
      }
      if (error instanceof SyntaxError) {
        throw new TaskStoreError(`Task file contains invalid JSON: ${this.filePath}`, error);
      }
      if (error instanceof ValidationError) {
        throw new TaskStoreError(`Task file has an invalid structure: ${this.filePath}`, error);
      }
      throw new TaskStoreError(`Unable to read task file: ${this.filePath}`, error);
    }
  }

  private async writeData(data: TaskFile): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    } catch (error: unknown) {
      throw new TaskStoreError(`Unable to write task file: ${this.filePath}`, error);
    }
  }

  private validateData(value: unknown): TaskFile {
    if (!isRecord(value) || !Array.isArray(value.tasks)) {
      throw new ValidationError("Expected an object with a tasks array.");
    }

    const tasks: Task[] = value.tasks.map((task: unknown) => {
      if (!isRecord(task)) {
        throw new ValidationError("Each task must be an object.");
      }
      if (!Number.isInteger(task.id) || task.id <= 0) {
        throw new ValidationError("Each task requires a positive integer id.");
      }
      if (typeof task.title !== "string" || task.title.trim().length === 0) {
        throw new ValidationError("Each task requires a non-empty title.");
      }
      if (task.status !== "pending" && task.status !== "completed") {
        throw new ValidationError("Each task status must be pending or completed.");
      }
      if (typeof task.createdAt !== "string") {
        throw new ValidationError("Each task requires a createdAt timestamp.");
      }
      if (task.completedAt !== undefined && typeof task.completedAt !== "string") {
        throw new ValidationError("completedAt must be a timestamp string when present.");
      }
      return task as Task;
    });

    return { tasks };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
