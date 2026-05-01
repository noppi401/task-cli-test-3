export class Task {
  constructor(id, title, status = 'pending', createdAt = new Date().toISOString(), completedAt = null) {
    this.id = id;
    this.title = title;
    this.status = status;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
  }

  static validate(title) {
    if (!title || typeof title !== 'string') {
      throw new Error('Task title must be a non-empty string');
    }

    const trimmed = title.trim();
    if (!trimmed) {
      throw new Error('Task title cannot be empty or whitespace only');
    }

    if (trimmed.length > 500) {
      throw new Error('Task title must not exceed 500 characters');
    }

    return trimmed;
  }

  static validateId(id) {
    const parsed = parseInt(id, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error('Task ID must be a positive integer');
    }
    return parsed;
  }

  static validateStatus(status) {
    const valid = ['pending', 'completed'];
    if (!valid.includes(status)) {
      throw new Error(`Status must be one of: ${valid.join(', ')}`);
    }
    return status;
  }

  complete() {
    this.status = 'completed';
    this.completedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      createdAt: this.createdAt,
      completedAt: this.completedAt
    };
  }
}