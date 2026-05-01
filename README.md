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
npm start delete 1 -fforce  # Skip confirmation
```

## Features

- Add, list, complete, and delete tasks
- Persistent storage using JSON files
- Task filtering by status (pending, completed, all)
- Optional confirmation for deletions
- Clear command feedback for all operations
- Unique task IDs with timestamps