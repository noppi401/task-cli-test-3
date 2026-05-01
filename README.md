# Task Management CLI

A command-line interface (CLI) application for managing tasks with persistent storage using JSON files.

## Features

- "✅ Add new tasks with automatic ID assignment
- ✅ List all tasks with optional filtering (pending/completed)
- ✅ Mark tasks as completed
- ✅ Delete tasks permanently
- ✅ Persist data to JSON file
- ✅ Clear error handling and user feedback

## Installation

```bash
npm install
```

## Usage

### Add a Task

```bash
node dist/index.js add "Buy groceries"
# Output: Task added (ID: 1)
```

### List Tasks

```bash
# List all tasks
node dist/index.js list

# List only pending tasks
node dist/index.js list --pending

# List only completed tasks
node dist/index.js list --completed
```

### Mark Task as Complete

```bash
node dist/index.js complete 1
# Output: Task 1 marked as complete
```

### Delete a Task

```bash
node dist/index.js delete 1
# Output: Task 1 deleted
```

## Data Storage

Tasks are stored in `tasks.json` in the current working directory. The file structure is:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2024-01-01T10:00:00Z",
      "completedAt": null
    }
  ]
}
```

## API Reference

### Commands

| Command | Arguments | Description |
|--------|--------|--------|
| `add` | `<title>` | Add a new task |
| `list` | `[--pending \| --completed]` | List tasks with optional filter |
| `complete` | `<id>` | Mark task as completed |
| `delete` | `<id>` | Delete a task |
| `help` | | Show help message |

### Data Structure

Each task object contains:
- `id` (number): Unique identifier
- `title` (string): Task description
- `status` (string): Either "pending" or "completed"
- `createdAt` (string): ISO timestamp when task was created
- `completedAt` (string, optional): ISO timestamp when task was completed

## Error Handling

The CLI handles the following error cases:
- Missing or invalid task ID
- Non-existent task references
- Empty task titles
- File I/O errors with graceful messages

## License

MIT