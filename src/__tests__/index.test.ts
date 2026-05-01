import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

describe('Task Management CLI', () => {
  beforeEach(() => {
    if (fs.existsSync(TASKS_FILE)) {
      fs.unlinkSync(TASKS_FILE);
    }
  });

  afterEach(() => {
    if (fs.existsSync(TASKS_FILE)) {
      fs.unlinkSync(TASKS_FILE);
    }
  });

  test('should add a task', () => {
    const output = execSync('node dist/index.js add "Test task"', { encoding: 'utf-8' });
    expect(output).toContain('Task added');
    expect(fs.existsSync(TASKS_FILE)).toBe(true);
  });

  test('should list tasks', () => {
    execSync('node dist/index.js add "Task 1"', { encoding: 'utf-8' });
    execSync('node dist/index.js add "Task 2"', { encoding: 'utf-8' });
    const output = execSync('node dist/index.js list', { encoding: 'utf-8' });
    expect(output).toContain('Task 1');
    expect(output).toContain('Task 2');
  });

  test('should complete a task', () => {
    execSync('node dist/index.js add "Task to complete"', { encoding: 'utf-8' });
    const output = execSync('node dist/index.js complete 1', { encoding: 'utf-8' });
    expect(output).toContain('marked as complete');
  });

  test('should delete a task', () => {
    execSync('node dist/index.js add "Task to delete"', { encoding: 'utf-8' });
    const output = execSync('node dist/index.js delete 1', { encoding: 'utf-8' });
    expect(output).toContain('deleted');
  });

  test('should filter pending tasks', () => {
    execSync('node dist/index.js add "Pending task"', { encoding: 'utf-8' });
    execSync('node dist/index.js add "Completed task"', { encoding: 'utf-8' });
    execSync('node dist/index.js complete 2', { encoding: 'utf-8' });
    const output = execSync('node dist/index.js list --pending', { encoding: 'utf-8' });
    expect(output).toContain('Pending task');
    expect(output).not.toContain('Completed task');
  });

  test('should error when adding task without title', () => {
    expect(() => {
      execSync('node dist/index.js add', { encoding: 'utf-8' });
    }).toThrow();
  });

  test('should error when completing non-existent task', () => {
    expect(() => {
      execSync('node dist/index.js complete 999', { encoding: 'utf-8' });
    }).toThrow();
  });

  test('should error when deleting non-existent task', () => {
    expect(() => {
      execSync('node dist/index.js delete 999', { encoding: 'utf-8' });
    }).toThrow();
  });

  test('should persist data between sessions', () => {
    execSync('node dist/index.js add "Task 1"', { encoding: 'utf-8' });
    execSync('node dist/index.js add "Task 2"', { encoding: 'utf-8' });
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
    expect(data.tasks.length).toBe(2);
  });
});