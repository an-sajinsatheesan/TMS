import axiosInstance from '../../api/axios.instance';

export const columnsService = {
  /**
   * Get all columns for a project
   */
  getAll: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/columns`);
      return response;
    } catch (error) {
      console.error('Error fetching columns:', error);
      throw error;
    }
  },

  /**
   * Create a new column
   */
  create: async (projectId, columnData) => {
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/columns`, columnData);
      return response;
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    }
  },

  /**
   * Update a column
   */
  update: async (projectId, columnId, updates) => {
    try {
      const response = await axiosInstance.patch(`/projects/${projectId}/columns/${columnId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating column:', error);
      throw error;
    }
  },

  /**
   * Delete a column
   */
  delete: async (projectId, columnId) => {
    try {
      const response = await axiosInstance.delete(`/projects/${projectId}/columns/${columnId}`);
      return response;
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  },

  /**
   * Reorder columns
   */
  reorder: async (projectId, columnIds) => {
    try {
      const response = await axiosInstance.patch(`/projects/${projectId}/columns/reorder`, {
        columnIds,
      });
      return response;
    } catch (error) {
      console.error('Error reordering columns:', error);
      throw error;
    }
  },
};
