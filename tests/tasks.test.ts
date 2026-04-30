// @ts-nocheck
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { runCli, TaskRepository } from '../src/index.js';

function createOutput() {
  let output = '';
  return {
    stream: {
      write(chunk: string): void {
        output += chunk;
      }
    },
    text(): string {
      return output;
    }
  };
}

describe('complete command', () => {
  let dir = '';
  let path = '';

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'task-cli-'));
    path = join(dir, 'tasks.json');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('completes a task and persists the updated status through the CLI path', async () => {
    const repo = new TaskRepository({ storagePath: path });
    const task = await repo.addTask('Write tests');
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = await runCli(['complete', String(task.id)], {
      repository: new TaskRepository({ storagePath: path }),
      stdout: stdout.stream,
      stderr: stderr.stream
    });

    const stored = JSON.parse(await readFile(path, 'utf8'));
    expect(exitCode).toBe(0);
    expect(stdout.text()).toContain(`Task ${task.id} marked as complete`);
    expect(stderr.text()).toBe('');
    expect(stored.tasks[0].status).toBe('completed');
    expect(stored.tasks[0].completedAt).toEqual(expect.any(String));
  });

  it('returns an error when complete is missing the task id', async () => {
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = await runCli(['complete'], {
      repository: new TaskRepository({ storagePath: path }),
      stdout: stdout.stream,
      stderr: stderr.stream
    });

    expect(exitCode).toBe(1);
    expect(stdout.text()).toBe('');
    expect(stderr.text()).toContain('Task id must be a positive integer');
  });

  it('returns an error for an invalid complete task id', async () => {
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = await runCli(['complete', 'abc'], {
      repository: new TaskRepository({ storagePath: path }),
      stdout: stdout.stream,
      stderr: stderr.stream
    });

    expect(exitCode).toBe(1);
    expect(stdout.text()).toBe('');
    expect(stderr.text()).toContain('Task id must be a positive integer');
  });

  it('returns an error when the task does not exist', async () => {
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = await runCli(['complete', '99'], {
      repository: new TaskRepository({ storagePath: path }),
      stdout: stdout.stream,
      stderr: stderr.stream
    });

    expect(exitCode).toBe(1);
    expect(stdout.text()).toBe('');
    expect(stderr.text()).toContain('Task 99 not found');
  });
});
