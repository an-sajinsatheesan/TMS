import { createSlice } from '@reduxjs/toolkit';
import { dummySections, dummyTasks } from '@/constants/dummyData';

const initialState = {
  sections: dummySections,
  tasks: dummyTasks,
  collapsedGroups: {}, // { sectionId: boolean }
  columns: [
    { id: 'taskNumber', label: '#', visible: true, fixed: true, width: 60 },
    { id: 'taskName', label: 'Task Name', visible: true, fixed: true, width: 300 },
    { id: 'assignee', label: 'Assignee', visible: true, fixed: false, width: 150 },
    { id: 'status', label: 'Status', visible: true, fixed: false, width: 120 },
    { id: 'dueDate', label: 'Due Date', visible: true, fixed: false, width: 120 },
    { id: 'priority', label: 'Priority', visible: true, fixed: false, width: 100 },
    { id: 'startDate', label: 'Start Date', visible: false, fixed: false, width: 120 },
    { id: 'tags', label: 'Tags', visible: false, fixed: false, width: 150 },
  ],
  sortConfig: {
    column: null,
    direction: 'asc', // 'asc' or 'desc'
  },
};

const listViewSlice = createSlice({
  name: 'listView',
  initialState,
  reducers: {
    // Toggle group collapse/expand
    toggleGroupCollapse: (state, action) => {
      const sectionId = action.payload;
      state.collapsedGroups[sectionId] = !state.collapsedGroups[sectionId];
    },

    // Reorder sections (groups)
    reorderSections: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [movedSection] = state.sections.splice(sourceIndex, 1);
      state.sections.splice(destinationIndex, 0, movedSection);

      // Update orderIndex for all sections
      state.sections.forEach((section, index) => {
        section.orderIndex = index;
      });
    },

    // Reorder tasks within same section or between sections
    reorderTasks: (state, action) => {
      const { taskId, sourceSectionId, destinationSectionId, destinationIndex } = action.payload;

      // Find the task to move
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const task = state.tasks[taskIndex];

      // Update task's sectionId if moving to different section
      if (sourceSectionId !== destinationSectionId) {
        task.sectionId = destinationSectionId;
      }

      // Remove task from current position
      state.tasks.splice(taskIndex, 1);

      // Find tasks in destination section
      const sectionTasks = state.tasks.filter(t =>
        t.sectionId === destinationSectionId && t.level === 0
      );

      // Calculate new orderIndex
      if (destinationIndex === 0) {
        task.orderIndex = sectionTasks.length > 0 ? sectionTasks[0].orderIndex - 1 : 0;
      } else if (destinationIndex >= sectionTasks.length) {
        task.orderIndex = sectionTasks.length > 0
          ? sectionTasks[sectionTasks.length - 1].orderIndex + 1
          : 0;
      } else {
        const beforeTask = sectionTasks[destinationIndex - 1];
        const afterTask = sectionTasks[destinationIndex];
        task.orderIndex = (beforeTask.orderIndex + afterTask.orderIndex) / 2;
      }

      // Insert task back
      state.tasks.splice(taskIndex, 0, task);

      // Re-sort tasks by section and orderIndex
      state.tasks.sort((a, b) => {
        if (a.sectionId !== b.sectionId) {
          const sectionA = state.sections.find(s => s.id === a.sectionId);
          const sectionB = state.sections.find(s => s.id === b.sectionId);
          return (sectionA?.orderIndex || 0) - (sectionB?.orderIndex || 0);
        }
        return a.orderIndex - b.orderIndex;
      });
    },

    // Toggle task completion
    toggleTaskCompletion: (state, action) => {
      const taskId = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
      }
    },

    // Add new task to section
    addTask: (state, action) => {
      const { sectionId, taskName } = action.payload;

      // Find max orderIndex in section
      const sectionTasks = state.tasks.filter(t =>
        t.sectionId === sectionId && t.level === 0
      );
      const maxOrderIndex = sectionTasks.length > 0
        ? Math.max(...sectionTasks.map(t => t.orderIndex))
        : -1;

      const newTask = {
        id: `task-${Date.now()}`,
        name: taskName,
        description: '',
        type: 'task',
        completed: false,
        sectionId,
        projectId: 'proj-1',
        assigneeId: null,
        assigneeName: null,
        assigneeAvatar: null,
        startDate: null,
        dueDate: null,
        priority: null,
        status: null,
        approvalStatus: null,
        tags: [],
        customFields: {},
        orderIndex: maxOrderIndex + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        createdBy: 'current-user',
        parentId: null,
        level: 0,
        isExpanded: false,
        subtaskCount: 0,
      };

      state.tasks.push(newTask);
    },

    // Toggle column visibility
    toggleColumnVisibility: (state, action) => {
      const columnId = action.payload;
      const column = state.columns.find(c => c.id === columnId);
      if (column && !column.fixed) {
        column.visible = !column.visible;
      }
    },

    // Reorder columns
    reorderColumns: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [movedColumn] = state.columns.splice(sourceIndex, 1);
      state.columns.splice(destinationIndex, 0, movedColumn);
    },

    // Set sort configuration
    setSortConfig: (state, action) => {
      const { column, direction } = action.payload;
      state.sortConfig = { column, direction };

      // Sort tasks based on configuration
      if (column && direction) {
        state.tasks.sort((a, b) => {
          let aValue = a[column];
          let bValue = b[column];

          // Handle null/undefined values
          if (aValue == null) return direction === 'asc' ? 1 : -1;
          if (bValue == null) return direction === 'asc' ? -1 : 1;

          // Handle different data types
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (aValue < bValue) return direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    },

    // Expand/collapse task subtasks
    toggleTaskExpand: (state, action) => {
      const taskId = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.isExpanded = !task.isExpanded;
      }
    },
  },
});

export const {
  toggleGroupCollapse,
  reorderSections,
  reorderTasks,
  toggleTaskCompletion,
  addTask,
  toggleColumnVisibility,
  reorderColumns,
  setSortConfig,
  toggleTaskExpand,
} = listViewSlice.actions;

export default listViewSlice.reducer;
