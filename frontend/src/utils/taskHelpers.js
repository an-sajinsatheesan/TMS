/**
 * Sort tasks by a given field
 */
export const sortTasks = (tasks, sortBy) => {
  if (!sortBy || !tasks) return tasks;

  const sorted = [...tasks];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'startDate':
      return sorted.sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate) - new Date(b.startDate);
      });

    case 'dueDate':
      return sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

    case 'priority':
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return sorted.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] || 4;
        const bPriority = priorityOrder[b.priority] || 4;
        return aPriority - bPriority;
      });

    case 'assignee':
      return sorted.sort((a, b) => {
        if (!a.assigneeName) return 1;
        if (!b.assigneeName) return -1;
        return a.assigneeName.localeCompare(b.assigneeName);
      });

    case 'status':
      const statusOrder = { 'On Track': 1, 'At Risk': 2, 'Off Track': 3 };
      return sorted.sort((a, b) => {
        const aStatus = statusOrder[a.status] || 4;
        const bStatus = statusOrder[b.status] || 4;
        return aStatus - bStatus;
      });

    case 'createdBy':
      return sorted.sort((a, b) => {
        if (!a.createdBy) return 1;
        if (!b.createdBy) return -1;
        return a.createdBy.localeCompare(b.createdBy);
      });

    case 'createdAt':
      return sorted.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    case 'updatedAt':
      return sorted.sort((a, b) => {
        if (!a.updatedAt) return 1;
        if (!b.updatedAt) return -1;
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      });

    case 'completedAt':
      return sorted.sort((a, b) => {
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        return new Date(a.completedAt) - new Date(b.completedAt);
      });

    case 'orderIndex':
    default:
      return sorted.sort((a, b) => a.orderIndex - b.orderIndex);
  }
};

/**
 * Get date range for a specific period
 */
const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'thisWeek': {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { start: startOfWeek, end: endOfWeek };
    }
    case 'nextWeek': {
      const dayOfWeek = today.getDay();
      const startOfNextWeek = new Date(today);
      startOfNextWeek.setDate(today.getDate() + (7 - dayOfWeek));
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
      return { start: startOfNextWeek, end: endOfNextWeek };
    }
    case 'thisMonth': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: startOfMonth, end: endOfMonth };
    }
    default:
      return null;
  }
};

/**
 * Filter tasks based on filter criteria
 */
export const filterTasks = (tasks, filters) => {
  if (!filters || filters.length === 0) return tasks;

  return tasks.filter((task) => {
    return filters.every((filter) => {
      switch (filter.field) {
        case 'assignee':
          return task.assigneeId === filter.value;

        case 'myTasks':
          return task.assigneeId === filter.value;

        case 'priority':
          return task.priority === filter.value;

        case 'status':
          return task.status === filter.value;

        case 'completed':
          return task.completed === filter.value;

        case 'tags':
          return task.tags.includes(filter.value);

        case 'dueThisWeek':
        case 'dueNextWeek':
        case 'dueThisMonth': {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const period = filter.field === 'dueThisWeek' ? 'thisWeek' :
                        filter.field === 'dueNextWeek' ? 'nextWeek' : 'thisMonth';
          const range = getDateRange(period);
          if (!range) return false;
          return dueDate >= range.start && dueDate <= range.end;
        }

        case 'search':
          return (
            task.name.toLowerCase().includes(filter.value.toLowerCase()) ||
            task.description?.toLowerCase().includes(filter.value.toLowerCase())
          );

        default:
          return true;
      }
    });
  });
};

/**
 * Group tasks by a field
 */
export const groupTasks = (tasks, groupBy) => {
  if (!groupBy) return { ungrouped: tasks };

  return tasks.reduce((groups, task) => {
    const key = task[groupBy] || 'None';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(task);
    return groups;
  }, {});
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate a color from a string (for avatars)
 */
export const stringToColor = (str) => {
  if (!str) return '#94a3b8';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Calculate task completion percentage for a section
 */
export const calculateSectionProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter((task) => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

/**
 * Get priority severity for PrimeReact Tag component
 */
export const getPrioritySeverity = (priority) => {
  switch (priority) {
    case 'High':
      return 'danger';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'info';
    default:
      return null;
  }
};

/**
 * Get status severity for PrimeReact Tag component
 */
export const getStatusSeverity = (status) => {
  switch (status) {
    case 'On Track':
      return 'success';
    case 'At Risk':
      return 'warning';
    case 'Off Track':
      return 'danger';
    default:
      return null;
  }
};
