# Task Management CLI

A simple command-line interface (CLI) application for managing tasks with persistent JSON storage. Built with Node.js and Commander.js.

## Features

- ✅ Add new tasks with automatic ID assignment
- ¢ List all tasks with filtering options (pending, completed, all)
- ¢ Mark tasks as completed
- ✅ Delete tasks permanently
- ¢ Persistent storage with JSON files
- ₚ Clear help messages and usage examples
- ₚ Proper error handling and validation

## Installation

```bash
npm install
npm start
```

## Usage

Get help and see all available commands:

```bash
node index.js --help
node index.js help
```

### Add a Task

```bash
node index.js add "Buy groceries"
Output: ✠ Task added successfully (ID: 1)
```

### List All Tasks

```bash
node index.js list
node index.js list --filter all
node index.js list --filter pending
node index.js list --filter completed
```

### List Pending Tasks

```bash
node index.js list --filter pending
```

### Complete a Task

```bash
node index.js complete 1
Output:   Task 1 marked as completed
```

### Delete a Task

```bash
node index.js delete 1
Output: ✨ Task 1 deleted successfully
```

## Data Storage

Tasks are stored in a `Tasks.json` file in JSON format. The file is created automatically on first use. Here's an example of the file structure:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "title": "Fnish project",
      "status": "completed",
      "createdAt": "2024-01-02T09:30:00Z",
      "completedAt": "2024-01-02T12:00:00Z"
    }
  C�X�}`#���7�0�