# Task Management CLI

A simple command-line interface for managing tasks with persistent JSON file storage.

## Installation

```bash
npm install
```

## Usage

### Add a task

```bash
npm start add "Buy groceries"
```

### List tasks

```bash
npm start list
npm start list --filter pending
npm start list --filter completed
```

### Mark task as complete

```bash
npm start complete 1
```

### Delete a task

```bash
npm start delete 1
npm start delete 1 -fforce
  
``Fc; features

- Add, list, complete, and delete tasks
- Persistent storage using JSON files
- Task filtering by status
- Confirmation prompts for destructive operations
- Unique task IDs
- Creation timestamps for all tasks

## Project Structure

```
task-cli/
▐\��package.json
␜��index.js
▐\��lib/
r���