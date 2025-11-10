import axiosInstance from '../../api/axios.instance';

export const projectRolesService = {
  /**
   * Get all available project member roles
   */
  getRoles: async () => {
    try {
      const response = await axiosInstance.get('/project-roles');
      return response;
    } catch (error) {
      console.error('Error fetching project roles:', error);
      throw error;
    }
  },

  /**
   * Get default role for new members
   */
  getDefaultRole: async () => {
    try {
      const response = await axiosInstance.get('/project-roles/default');
      return response;
    } catch (error) {
      console.error('Error fetching default role:', error);
      throw error;
    }
  },

  /**
   * Get specific role details
   */
  getRole: async (roleValue) => {
    try {
      const response = await axiosInstance.get(`/project-roles/${roleValue}`);
      return response;
    } catch (error) {
      console.error(`Error fetching role ${roleValue}:`, error);
      throw error;
    }
  },
};
