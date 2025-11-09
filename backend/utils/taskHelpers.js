/**
 * Task Helper Functions
 * Utilities for task manipulation and transformation
 */

/**
 * Build hierarchical task tree from flat task list
 * @param {Array} tasks - Flat array of tasks
 * @param {String} parentId - Parent task ID (null for root tasks)
 * @returns {Array} Hierarchical task array
 */
const buildTaskHierarchy = (tasks, parentId = null) => {
  // Filter tasks that belong to this level
  const children = tasks.filter((task) => task.parentId === parentId);

  // Recursively build hierarchy for each child
  return children.map((task) => {
    const subtasks = buildTaskHierarchy(tasks, task.id);

    return {
      ...task,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    };
  });
};

/**
 * Transform task for API response
 * Converts database task fields to UI-friendly format
 * @param {Object} task - Task object from database
 * @returns {Object} Transformed task object
 */
const transformTask = (task) => {
  const transformed = {
    ...task,
    name: task.title,
    assigneeName: task.assignee?.fullName || null,
    assigneeAvatar: task.assignee?.avatarUrl || null,
    subtaskCount: task._count?.subtasks || 0,
    isExpanded: false,
  };

  // Recursively transform subtasks if they exist
  if (task.subtasks && Array.isArray(task.subtasks)) {
    transformed.subtasks = task.subtasks.map(transformTask);
  }

  return transformed;
};

/**
 * Flatten hierarchical task tree to flat array
 * Useful for operations that need all tasks regardless of hierarchy
 * @param {Array} tasks - Hierarchical task array
 * @returns {Array} Flat task array
 */
const flattenTaskHierarchy = (tasks) => {
  const flattened = [];

  const flatten = (taskList) => {
    taskList.forEach((task) => {
      const { subtasks, ...taskWithoutSubtasks } = task;
      flattened.push(taskWithoutSubtasks);

      if (subtasks && subtasks.length > 0) {
        flatten(subtasks);
      }
    });
  };

  flatten(tasks);
  return flattened;
};

module.exports = {
  buildTaskHierarchy,
  transformTask,
  flattenTaskHierarchy,
};
