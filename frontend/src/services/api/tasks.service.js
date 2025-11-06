import axiosInstance from '../../api/axios.instance';

export const tasksService = {
  /**
   * Get all tasks for a project
   */
  getAll: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.sectionId) params.append('sectionId', filters.sectionId);
      if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);
      if (filters.completed !== undefined) params.append('completed', filters.completed);
      if (filters.search) params.append('search', filters.search);
      if (filters.parentId !== undefined) params.append('parentId', filters.parentId);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axiosInstance.get(`/projects/${projectId}/tasks?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Get a single task by ID with full details (includes comments and subtasks)
   */
  getById: async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  /**
   * Create a new task
   */
  create: async (projectId, taskData) => {
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/tasks`, taskData);
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Update a task
   */
  update: async (taskId, updates) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  /**
   * Delete a task
   */
  delete: async (taskId) => {
    try {
      const response = await axiosInstance.delete(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  /**
   * Move a task to a different section
   */
  move: async (taskId, toSectionId, orderIndex) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/move`, {
        toSectionId,
        orderIndex,
      });
      return response;
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  },

  /**
   * Duplicate a task
   */
  duplicate: async (taskId) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/duplicate`);
      return response;
    } catch (error) {
      console.error('Error duplicating task:', error);
      throw error;
    }
  },

  /**
   * Create a subtask
   */
  createSubtask: async (taskId, subtaskData) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/subtasks`, subtaskData);
      return response;
    } catch (error) {
      console.error('Error creating subtask:', error);
      throw error;
    }
  },

  /**
   * Get comments for a task
   */
  getComments: async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return response;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  /**
   * Add a comment to a task
   */
  addComment: async (taskId, content) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, { content });
      return response;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId) => {
    try {
      const response = await axiosInstance.delete(`/comments/${commentId}`);
      return response;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};
