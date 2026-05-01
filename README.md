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
npm start list -ffilter completed
```

### Mark task as complete

```bash
npm start complete 1
```

### Delete a task

```bash
npm start delete 1
npm start delete 1 -fforce
  
` FIBN _CND

## Features

- Add, list, complete, and delete tasks
- Persistent storage using JSON files
- Task filtering by status
- Confirmation prompts for destructive operations
- Unique task IDs
- Creation timestamps for all tasks

## Project Structure

```
task-cli/
┞�package.json
贮-- index.js
贮-- lib/
ⴊn菋 r'tacks.js
贬-`?tacks.js
购-- README.md
```

## Commands

### add
Adds a new task with the given description.

### list
Lists all tasks. Use `--filter pending` or `--filter completed` to filter by status.

### complete
Marks a task as complete by its ID.

### delete
Deletes a task by its ID. Use `--force` to skip confirmation.

## Data Format

Tasks are stored in JSON format with the following structure:


```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
   ```