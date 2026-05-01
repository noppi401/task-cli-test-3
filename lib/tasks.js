export class TaskError extends Error {
  constructor(message, code = 'TASK_ERROR') {
    super(message);
    this.name = 'TaskError';
    this.code = code;
  }
}

export class Tasks {
  constructor(filePath) {
    if (!filePath) {
      throw new TaskError('File path is required', 'INVALID_CONFIG');
    }
    this.filePath = filePath;
  }

  async load() {
    try {
      const { readFile } = await import('fs/promises');
      const data = await readFile(this.filePath, 'utf8');

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        throw new TaskError(
          `Malformed JSON in storage file: ${e.message}`,
          'MALFORMED_JSON'
        );
      }

      if (!Array.isArray(parsed.tasks)) {
        throw new TaskError(
          'Invalid storage format: tasks must be an array',
          'INVALID_FORMAT'
        );
      }

      return parsed.tasks;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      if (error instanceof TaskError) {
        throw error;
      }
      throw new TaskError(
        `Failed to read storage file: ${error.message}`,
        'READ_ERROR'
      );
    }
  }

  async save(tasks) {
    if (!Array.isArray(tasks)) {
      throw new TaskError('Tasks must be an array', 'INVALID_TASKS');
    }

    try {
      const { writeFile } = await import('fs/promises');
      const data = JSON.stringify({ tasks }, null, 2);
      await writeFile(this.filePath, data, 'utf8');
    } catch (error) {
      throw new TaskError(
        `Failed to write storage file: ${error.message}`,
        'WRITE_ERROR'
      );
    }
  }

  async add(title) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new TaskError(
        'Task title cannot be empty',
        'INVALID_TITLE'
      );
    }

    const tasks = await this.load();
    const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    const task = {
      id,
      title: title.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    tasks.push(task);
    await this.save(tasks);
    return task;
  }

  async list() {
    return this.load();
  }

  async complete(id) {
    const taskId = this._validateTaskId(id);
    const tasks = await this.load();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      throw new TaskError(
        `Task with ID ${taskId} not found`,
        'TASK_NOT_FOUND'
      );
    }

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    await this.save(tasks);
    return task;
  }

  async delete(id) {
    const taskId = this._validateTaskId(id);
    const tasks = await this.load();
    const index = tasks.findIndex(t => t.id === taskId);

    if (index === -1) {
      throw new TaskError(
        `Task with ID ${taskId} not found`,
        'TASK_NOT_FOUND'
      );
    }

    const [deleted] = tasks.splice(index, 1);
    await this.save(tasks);
    return deleted;
  }

  _validateTaskId(id) {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new TaskError(
        `Invalid task ID: must be a positive integer`,
        'INVALID_ID'
      );
    }
    return parsed;
  }
}