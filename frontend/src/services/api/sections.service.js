import axiosInstance from '../../api/axios.instance';

export const sectionsService = {
  /**
   * Get all sections for a project
   */
  getAll: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/sections`);
      return response;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  },

  /**
   * Get a single section by ID
   */
  getById: async (sectionId) => {
    try {
      const response = await axiosInstance.get(`/sections/${sectionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching section:', error);
      throw error;
    }
  },

  /**
   * Create a new section
   */
  create: async (projectId, sectionData) => {
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/sections`, sectionData);
      return response;
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  },

  /**
   * Update a section
   */
  update: async (sectionId, updates) => {
    try {
      const response = await axiosInstance.patch(`/sections/${sectionId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  },

  /**
   * Delete a section
   */
  delete: async (sectionId) => {
    try {
      const response = await axiosInstance.delete(`/sections/${sectionId}`);
      return response;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  },

  /**
   * Reorder sections
   */
  reorder: async (projectId, sectionIds) => {
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/sections/reorder`, {
        sectionIds,
      });
      return response;
    } catch (error) {
      console.error('Error reordering sections:', error);
      throw error;
    }
  },
};
