# Task Management CLI

A simple command-line interface for managing tasks with persistent JSON file storage.

## Installation

### Usage

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
npm start delete 1 --force  # Skip confirmation
```

## Features

- ✅ Add, list, complete, and delete tasks
- ✅ Persistent storage using JSON files
- ✅ Task status tracking (pending/completed)
- ➅ Timestamps for creation and completion
- �︌Confirmation prompts for deletion
- ✅ Filtering options for listing tasks
- ✅ Clear user feedback with visual indicators

## Data Format

Tasks are stored in `tasks.json`:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "lastUpdated": "2024-01-01T10:05:00Z"
}
```

## License

MIT