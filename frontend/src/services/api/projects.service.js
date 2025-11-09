import axiosInstance from '../../api/axios.instance';

export const projectsService = {
  /**
   * Get all projects
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/projects');
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Get a single project by ID
   */
  getById: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}`);
      return response;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  /**
   * Create a new project
   */
  create: async (projectData) => {
    try {
      const response = await axiosInstance.post('/projects', projectData);
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update a project
   */
  update: async (projectId, updates) => {
    try {
      const response = await axiosInstance.patch(`/projects/${projectId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  /**
   * Delete a project
   */
  delete: async (projectId) => {
    try {
      const response = await axiosInstance.delete(`/projects/${projectId}`);
      return response;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  /**
   * Update project status
   */
  updateStatus: async (projectId, status) => {
    try {
      const response = await axiosInstance.patch(`/projects/${projectId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  },

  /**
   * Update project due date
   */
  updateDueDate: async (projectId, dueDate) => {
    try {
      const response = await axiosInstance.patch(`/projects/${projectId}/due-date`, { dueDate });
      return response;
    } catch (error) {
      console.error('Error updating project due date:', error);
      throw error;
    }
  },

  /**
   * Move project to trash (soft delete)
   */
  moveToTrash: async (projectId) => {
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/trash`);
      return response;
    } catch (error) {
      console.error('Error moving project to trash:', error);
      throw error;
    }
  },

  /**
   * Restore project from trash
   */
  restoreFromTrash: async (projectId) => {
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/restore`);
      return response;
    } catch (error) {
      console.error('Error restoring project:', error);
      throw error;
    }
  },

  /**
   * Permanently delete a trashed project
   */
  permanentDelete: async (projectId) => {
    try {
      const response = await axiosInstance.delete(`/projects/${projectId}/permanent`);
      return response;
    } catch (error) {
      console.error('Error permanently deleting project:', error);
      throw error;
    }
  },

  /**
   * List trashed projects
   */
  getTrash: async () => {
    try {
      const response = await axiosInstance.get('/projects/trash/list');
      return response;
    } catch (error) {
      console.error('Error fetching trashed projects:', error);
      throw error;
    }
  },

  /**
   * Get project activities
   */
  getActivities: async (projectId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/activities`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching project activities:', error);
      throw error;
    }
  },

  /**
   * Get project dashboard statistics
   */
  getDashboard: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/dashboard`);
      return response;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  /**
   * List project templates
   */
  getTemplates: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await axiosInstance.get('/projects/templates/list', { params });
      return response;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Clone a template to create a new project
   */
  cloneTemplate: async (templateId, name) => {
    try {
      const response = await axiosInstance.post(`/projects/templates/${templateId}/clone`, { name });
      return response;
    } catch (error) {
      console.error('Error cloning template:', error);
      throw error;
    }
  },
};
