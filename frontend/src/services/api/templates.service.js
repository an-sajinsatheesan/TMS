import axiosInstance from '../../api/axios.instance';

export const templatesService = {
  /**
   * Get all global templates
   */
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/templates', { params });
      return response;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Get template by ID with full details
   */
  getById: async (templateId) => {
    try {
      const response = await axiosInstance.get(`/templates/${templateId}`);
      return response;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  /**
   * Get template categories with statistics
   */
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/templates/categories/stats');
      return response;
    } catch (error) {
      console.error('Error fetching template categories:', error);
      throw error;
    }
  },

  /**
   * Create a new template (Super Admin only)
   */
  create: async (templateData) => {
    try {
      const response = await axiosInstance.post('/templates', templateData);
      return response;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  /**
   * Update a template (Super Admin only)
   */
  update: async (templateId, updates) => {
    try {
      const response = await axiosInstance.put(`/templates/${templateId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  /**
   * Delete a template (Super Admin only)
   */
  delete: async (templateId) => {
    try {
      const response = await axiosInstance.delete(`/templates/${templateId}`);
      return response;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },
};
