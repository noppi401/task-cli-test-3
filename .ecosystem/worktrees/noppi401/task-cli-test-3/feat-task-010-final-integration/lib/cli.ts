import { Command } from 'commander';
import { Task, TaskFilter, TaskStore } from './tasks.js';

interface GlobalOptions {
  file?: string;
}

interface ListOptions {
  filter?: string;
  pending?: boolean;
  completed?: boolean;
}

/** Creates the Commander program for the task CLI. */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('task-cli')
    .description('Manage tasks with JSON file persistence.')
    .version('1.0.0')
    .option('-f, --file <path>', 'path to the JSON task file', './tasks.json')
    .showHelpAfterError();

  program
    .command('add')
    .description('Add a new task')
    .argument('<task_description...>', 'task description')
    .action(async (descriptionParts: string[]): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const store = createStore(program.opts<GlobalOptions>());
        const task = await store.addTask(descriptionParts.join(' '));
        console.log(`Task added (ID: ${task.id})`);
      });
    });

  program
    .command('list')
    .description('List tasks')
    .option('--filter <status>', 'filter by status: all, pending, completed', 'all')
    .option('--pending', 'show only pending tasks')
    .option('--completed', 'show only completed tasks')
    .action(async (options: ListOptions): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const filter = parseListFilter(options);
        const store = createStore(program.opts<GlobalOptions>());
        printTasks(await store.listTasks(filter));
      });
    });

  program
    .command('complete')
    .description('Mark a task as completed')
    .argument('<task_id>', 'task ID')
    .action(async (taskId: string): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const store = createStore(program.opts<GlobalOptions>());
        const task = await store.completeTask(parseTaskId(taskId));
        console.log(`Task ${task.id} marked as complete`);
      });
    });

  program
    .command('delete')
    .description('Delete a task permanently')
    .argument('<task_id>', 'task ID')
    .action(async (taskId: string): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const store = createStore(program.opts<GlobalOptions>());
        const task = await store.deleteTask(parseTaskId(taskId));
        console.log(`Task ${task.id} deleted`);
      });
    });

  return program;
}

function createStore(options: GlobalOptions): TaskStore {
  return new TaskStore(options.file ?? './tasks.json');
}

function parseTaskId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Task ID must be a positive integer.');
  return id;
}

function parseListFilter(options: ListOptions): TaskFilter {
  if (options.pending && options.completed) {
    throw new Error('Use only one task status filter.');
  }
  if (options.pending) return 'pending';
  if (options.completed) return 'completed';
  return parseFilter(options.filter ?? 'all');
}

function parseFilter(value: string): TaskFilter {
  if (value === 'all' || value === 'pending' ||�[YHOOH	���\]Y	�H�]\���[YN����]�\��܊	њ[\�]\��HۙHَ�[[�[����\]Y��NB���[��[ۈ�[�\���\��Έ\���JN���YY�
\��˛[��OOH
H�ۜ��K���	ӛ�\�����[���N�]\��B��ۜ��K�X�J\��˛X\

\��HO�
�Q�\�˚Y]N�\�˝]K�]\Έ\�˜�]\�ܙX]Y�\�˘ܙX]Y]JJJNB��\�[���[��[ۈ[�Q\��ܜ�X�[ێ�

HO���Z\�O��Y�N���Z\�O��Y��H]�Z]X�[ۊ
NH�]�
\��܎�[�ۛ�ۊH�ۜ�Y\��Y�HH\��܈[��[��[و\��܈�\��܋�Y\��Y�H�	�[�[�^X�Y\��܈���\��Y���ۜ��K�\��܊\��܎�	�Y\��Y�_X
N���\�˙^]��HHNB�B