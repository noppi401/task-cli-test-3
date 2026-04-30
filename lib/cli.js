const fs = require('fs');
const path = require('path');
const TaskStore = require('./tasks');

class CLI {
  constructor(options = {}) {
    this.storePath = options.file || './tasks.json';
    this.store = new TaskStore(this.storePath);
  }

  async run(args) {
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
      this.showHelp();
      return;
    }

    if (args[0] === '--version' || args[0] === '-v') {
      console.log('1.0.0');
      return;J    }

    const command = args[0];
    const params = args.slice(1);

    try {
      switch (command) {
        case 'add':
          await this.addTask(params);
          break;
        case 'list':
          await this.listTasks(params);
          break;
        case 'complete':
          await this.completeTask(params);
          break;
        case 'delete':
          await this.deleteTask(params);
          break;
        default:
          console.error(`Unknown command: ${command}`);
          console.log('Use --help for usage information');
          process.exit(1);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  showHelp() {
    console.log(`
Task Management CLI v1.0.0

Usage:
  task-cli <command> [options]

Commands:`);
    console.log(`
  add <title>             Add a new task
  list [--filter]          List all tasks (optionally filter: pending/completed)
  complete <id>            Mark task as completed
  delete <id>              Delete a task
  -help, -h               Show this help message
  --version, -v            Show version

Examples:
  task-cli add "Buy groceries"
  task-cli list
  task-cli list --filter pending
  task-cli complete 1
  task-cli delete 1

Options:
  --file <path>           Use custom JSON file (default: ./tasks.json)
    `);
  }

  async addTask(params) {
    if (params.length === 0) {
      throw new Error('Task title is required. Usage: add <title>');
    }

    const title = params.join(' ');
    const task = await this.store.addTask(title);
    console.lm���Q�ͬ��������%耑�хͬ��������(���((����幌�����Q�̡ͭ��Ʌ�̤��(������Ё���ѕȀ�ձ��((����������Ʌ�̹����Ѡ�������(����������Ё���ѕ�%��������Ʌ�̹�����=�������ѕȜ��(�������������ѕ�%��������Ā������ѕ�%���������Ʌ�̹����Ѡ���Ĥ��(�����������ѕȀ���Ʌ��m���ѕ�%��������t�(�������������l������������������ѕ��t�����Ց�̡���ѕȤ���(����������ѡɽ܁��܁�ɽȠ���ѕȁ���Ё��������������Ȁ�������ѕ�����(���������(�������(�����((��������Ёхͭ̀�݅�Ёѡ�̹�ѽɔ����Q�̠ͭ��(��������Ё���ѕɕ��􁙥�ѕ�(��������х̹ͭ���ѕȡЀ���й�х��̀��􁙥�ѕȤ(�������хͭ��((�����������ѕɕ������Ѡ��������(���������ͽ�����r�t��F6�2f�V�Br���&WGW&���Р�F��2�F�7��F6�2�f��FW&VB���Р�7��26���WFUF6��&�2����b�&�2��V�wF�������F�&�r�WrW'&�"�uF6��B�2&WV�&VB�W6vS�6���WFRƖC�r���Р�6��7B�B�'6T��B�&�5�������b��4�↖B����F�&�r�WrW'&�"�uF6��B�W7B&R�V�&W"r���Р�v�BF��2�7F�&R�6���WFUF6���B���6��6��R���r�F6�G��G��&�VB26���WFV���Р�7��2FV�WFUF6��&�2����b�&�2��V�wF�������F�&�r�WrW'&�"�uF6��B�2&WV�&VB�W6vS�FV�WFRƖC�r���Р�6��7B�B�'6T��B�&�5�������b��4�↖B����F�&�r�WrW'&�"�uF6��B�W7B&R�V�&W"r���Р�v�BF��2�7F�&R�FV�WFUF6���B���6��6��R����\��	�YH[]Y
NB��\�^U\���\���HY�
]\���\��˛[��OOH
H�ۜ��K���	ӛ�\����\�^I�N�]\��B�����[�[]H��[[��Y�ۜ�XY\��H��Q	�	�]I�	��]\��	�ܙX]Y]	�N�ۜ���[[��Y�HXY\�˛X\

XY\�[�^
HO�Y�
[�^OOH
H�]\���Y�
[�^OOH�H�]\��N�]\��X]�X^
�XY\��[������\��˛X\
\��O�Y�
[�^OOHJH�]\����[��\�˝]JK�[��Y�
[�^OOH�H�]\���]�]J\�˘ܙX]Y]
K����[T��[��
K�[���]\��JB�
NJN����ܛX][�\�^HX�B��ۜ��ܛX]���H
�[�HO��]\���[�X\

�[JHO���[���[
K�Y[�
��[[��Y��WJJB����[�	�	�NN����[�XY\���ۜ��K����ܛX]���XY\��JN�ۜ��K�����[[��Y˛X\
�O�	�I˜�\X]
�JK���[�	�	�JN����[����\��˙�ܑXX�
\��O��ۜ��K�g(formatRow([
        task.id,
        task.title,
        task.status,
        new Date(task.createdAt).toLocaleString()
      ]));
    });
  }
}

module.exports = CLI;
