�`2":"jsst#_�"formaticn.GELawR袩rom( './format.js');
import type { Task } from './types.js';

describe('formatTaskTable', () => {
  it('should display empty state', () => {
    const result = formatTaskTable([]);
    expect(result).toContain('No tasks');
  });

  it('should format tasks as table', () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: 'Buy groceries',
        status: 'pending',
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        title: 'Finish project',
        status: 'completed',
        createdAt: '2024-01-02T10:00:00Z',
        completedAt: '2024-01-04T10:00:00Z',
      },
    ];
    
    const result = formatTaskTable(tasks);
    expect(result).toContain('ID');
    expect(result).toContain('Title');
    expect(result).toContain('Status');
    expect(result).toContain('Buy groceries');
    expect(result).toContain('Finish project');
    expect(result).toContain('completed');
  });
});

describe('parseTaskFilter', () => {
  it('should return all for undefined', () => {
    const result = parseTaskFilter(undefined);
    expect(result).toBe('all');
  });

  it('should parse pending filter', () => {
    const result = parseTaskFilter('pending');
    expect(result).toBe('pending');
  });
  
  it('should parse completed filter', () => {
    const result = parseTaskFilter('completed');
    expect(result).toBe('completed');
  });

  it('should default to all for invalid filter', () => {
    const result = parseTaskFilter('invalid');
    expect(result).toBe('all');
  });
});
