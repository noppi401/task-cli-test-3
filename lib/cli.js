import { Command } from 'commander';
import taskManager from './tasks.js';

export function createProgram() {
  const program = new Command();

  program
    .name('task-cli')
    .description('A simple task management CLI')
    .version('1.0.0');

  program
    .command('add <description>')
    .description('Add a new task')
    .action(async (description) => {
      try {
        const task = await taskManager.addTask(description);
        console.log(`Task added (ID: ${task.id})`);
      } catch (error) {
        console.error('Error adding task:', error.message);
      }
   });

  program
    .command('list')
    .description('List all tasks')
    .option('--filter <status>', 'Filter by status (pending/completed)')
    .action(async (options) => {
      try {
        const tasks = await taskManager.listTasks(options.filter);
        if (tasks.length === 0) {
          console.log('No tasks found.');
          return6�        }
        console.log('ID\tTitle\t\tStatus');
        tasks.forEach(task => {
          console.log(`${task.id}\t${task.title}\t\t${task.status}`);
        });
      } catch (error) {
        console.error('Error listing tasks:', error.message);
      }
    });

  program
    .command('complete <id>')
    .description('Mark a task as complete')
    .action(async (id) => {
      try {
        await taskManager.completeTask(parseInt(id));
        console.lm���Q�ͬ�����􁵅ɭ����́������ѕ���(������􁍅э�����ɽȤ��(�����������ͽ�����ɽȠ��ɽȁ������ѥ���хͬ蜰���ɽȹ���ͅ����(�������(�������((���ɽ�Ʌ�(������������������є�����(�������͍ɥ�ѥ�������є���хͬ��(�������ѥ�����幌����������(����������(���������݅�Ёхͭ5�����ȹ����ѕQ�ͬ����͕%�С�����(�����������ͽ��������Q�ͬ�����􁑕��ѕ����(������􁍅э�����ɽȤ��(�����������ͽ�����ɽȠ��ɽȁ����ѥ���хͬ蜰���ɽȹ���ͅ����(�������(�������((��ɕ��ɸ��ɽ�Ʌ��)�(