import { formatTasksTable, formatTable, formatTaskAdded, formatTaskCompleted, formatTaskDeleted, formatError } from './format.js';
import { Task } from './types.js';

describe('format', () => {
  describe('formatTasksTable', () => {
    it('should return empty message when no tasks', () => {
      const result = formatTasksTable([]);
      expect(result).toBe('No tasks found.');
    });

    it('should format tasks in table', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task 1', status: 'pending', createdAt: '2024-01-01T10:00:00Z' }
      ];
      const result = formatTasksTable(tasks);
      expect(result).toContain('ID');
      expect(result).toContain('Task 1');
      expect(result).toContain('pending');
    });

    it('should include all task fields in output', () => {
      const tasks: Task[] = [
        { id: 2, title: 'Buy groceries', status: 'completed', createdAt: '2024-01-15T14:30:00Z' }
      ];
      const result = formatTasksTable(tasks);
      expect(result).toContain('2');
      expect(result).toContain('Buy groceries');
      expect(result).toContain('completed');
    });
  });

  describe('formatTable', () => {
    it('should format headers and rows correctly', () => {
      const headers = ['Name', 'Age'];
      const rows = [['John', '30'], ['Jane', '25']];
      const result = formatTable(headers, rows);
      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('John');
      expect(result).toContain('Jane');
    });

    it('should pad columns properly', () => {
      const headers = ['A', 'B'];
      const rows = [['short', 'verylongvalue']];
      const result = formatTable(headers, rows);
      const lines = result.split('\n');
      expect(lines[0].length).toBe(lines[1].length);
    });
  });

  describe('formatTaskAdded', () => {
    it('should format task added message', () => {
      const result = formatTaskAdded(5);
      expect(result).toBe('Task added (ID: 5)');
    });
  });

  describe('formatTaskCompleted', () => {
    it('should format task completed message', () => {
      const result = formatTaskCompleted(3);
      expect(result).toBe('Task 3 marked as complete');
    });
  });

  describe('formatTaskDeleted', () => {
    it('should format task deleted message', () => {
      const result = formatTaskDeleted(7);
      expect(result).toBe('Task 7 deleted');
    });
  });

  describe('formatError', () => {
    it('should format error message', () => {
      const result = formatError('Something went wrong');
      expect(result).toBe('Error: Something went wrong');
    });
  });
});