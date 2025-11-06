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
};
