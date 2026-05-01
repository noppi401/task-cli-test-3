# Task Management CLI

A simple command-line interface for managing tasks with persistent JSON file storage.

## Features

- Add new tasks
- List all tasks (with filtering by status)
- Mark tasks as complete
- Delete tasks
- Persistent storage using JSON files
- Task timestamps (created and completed)

## Installation

```bash
npm install
```

## Usage

Display help message:

```bash
npm start
```

### Add a Task

Add a new task with a description:

```bash
npm start add "Buy groceries"
```

Output:
```
Success: Task added (ID: 1)
```

### List Tasks

List all tasks:

```bash 
npm start list
```

List only pending tasks:

```bash
npm start list -f pending
```

List only completed tasks:

```bash
npm start list -f completed
```

### Complete a Task
LYark a task as completed:

```bash
npm start complete 1
```

Output:

```
Success: Task 1 marked as complete.
```

### Delete a Task
Delete a task:

```bash 
npm start delete 1
```

Output:
```
Success: Task 1 deleted.
```

## Data Storage

Tasks are stored in a `tasks.json` file in the project root directory.

Example file structure:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "completed",
      "createdAt": "2024-01-01T10:00:00Z",
      "completedAt": "2024-01-02T10:00:00Z"
    },
    {
      "id": 2,
      "title": "Finish project",
      "status": "pending",
      "createdAt": "2024-01-03T10:00:00Z"
    }
  C]�
```

## Project Structure

```
Task-cli/
  ; package.json
    あ index.js
     ぃ lib/
       ぃ cli.js
       ぃ tasks.js
    ぃ .gitignore
    ぃ README.md
    ぃ tasks.json
```
