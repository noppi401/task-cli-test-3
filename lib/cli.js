import { Task } from './task.js';
import { TasksStorage } from './tasks.js';

export class CLI {
  constructor(storageFilePath = './tasks.json') {
    this.storage = new TasksStorage(storageFilePath);
  }

  async add(title) {
    try {
      const validated = Task.validate(title);
      const data = await this.storage.load();
      const id = this.storage.getNextId(data.tasks);
      const task = new Task(id, validated);
      data.tasks.push(task.toJSON());
      await this.storage.save(data);
      console.log(`Task added (ID: ${id})`);
      return task;
    } catch (error) {
      if (error.message.includes('Failed to')) {
        console.error('Error:', error.message);
        process.exit(1);
      }
      console.error('Error adding task:', error.message);
      process.exit(1);
    }
  }

  async list(filter = 'all') {
    try {
      if (!['all', 'pending', 'completed'].includes(filter)) {
        console.error(`Error: Unknown filter '${filter}'. Use: all, pending, or completed`);
        process.exit(1);
      }

      const data = await this.storage.load();
      let tasks = data.tasks;

      if (filter !== 'all') {
        tasks = tasks.filter(t => t.status === filter);
      }

      if (tasks.length === 0) {
        console.lm���9���홥�ѕȀ��􀝅���������聙��ѕȀ������хͭ́��չ�����(��������ɕ��ɸ�mt�(�������((���������ͽ��������q�%��Q�ѱ������������������������Mх��̜��(���������ͽ����������������������������������������������(������х̹ͭ�������хͬ�����(������������Ёѥѱ���хͬ�ѥѱ���Չ��ɥ��������������������(�����������ͽ����������M�ɥ���хͬ�����������̥���ѥѱ���хͬ��х�������(���������(���������ͽ���������((������ɕ��ɸ�хͭ��(����􁍅э�����ɽȤ��(���������ͽ�����ɽȠ��ɽȁ���ѥ���хͭ�蜰���ɽȹ���ͅ����(�������ɽ���̹��РĤ�(�����(���((����幌�������є������(��������(����������Ёхͭ%���Q�ͬ�م����ѕ%������(����������Ё��ф��݅�Ёѡ�̹�ѽɅ����������(����������Ёхͬ�􁑅ф�х̹ͭ�����Ѐ���й������хͭ%���((�����������хͬ���(�����������ͽ�����ɽȡ��ɽ��Q�ͬ�ݥѠ�%���хͭ%�􁹽Ё��չ����(���������ɽ���̹��РĤ�(�������((����������хͬ��х��̀��􀝍�����ѕ�����(�����������ͽ�����r�F6�G�F6��G��2�&VG�6���WFVF���&WGW&�F6���Р�F6��7FGW2�v6���WFVBs��F6��6���WFVDB��WrFFR���F��4�7G&��r����v�BF��2�7F�&vR�6fR�FF���6��6��R���r�F6�G�F6��G��&�VB26���WFV���&WGW&�F6����6F6��W'&�"���6��6��R�W'&�"�tW'&�"6���WF��rF6���r�W'&�"��W76vR���&�6W72�W��B����ТР�7��2FV�WFR��B���G'���6��7BF6��B�F6��fƖFFT�B��B���6��7BFF�v�BF��2�7F�&vR���B����6��7B��FW��FF�F6�2�f��D��FW��B��B�B���F6��B�����b���FW��������6��6��R�W'&�"�W'&�#�F6�v�F��BG�F6��G���Bf�V�F���&�6W72�W��B����Р�6��7BFV�WFVB�FF�F6�2�7Ɩ6R���FW����Ӱ�v�BF��2�7F�&vR�6fR�FF���6��6��R���r�F6�G�F6��G�FV�WFVF���&WGW&�FV�WFVC���6F6��W'&�"���6��6��R�W'&�"�tW'&�"FV�WF��rF6���r�W'&�"��W76vR���&�6W72�W��B����ТЧ�