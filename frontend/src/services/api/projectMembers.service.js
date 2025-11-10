import axiosInstance from '../../api/axios.instance';

export const projectMembersService = {
  /**
   * Get all members of a project
   */
  getAll: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/members`);
      return response;
    } catch (error) {
      console.error('Error fetching project members:', error);
      throw error;
    }
  },

  /**
   * Alias for getAll (backward compatibility)
   */
  list: async (projectId) => {
    return projectMembersService.getAll(projectId);
  },

  /**
   * Invite members to a project
   */
  invite: async (projectId, inviteData) => {
    try {
      const response = await axiosInstance.post(`/projects/${projectId}/members/invite`, inviteData);
      return response;
    } catch (error) {
      console.error('Error inviting members:', error);
      throw error;
    }
  },

  /**
   * Update a member's role
   */
  updateRole: async (projectId, memberId, role) => {
    try {
      const response = await axiosInstance.patch(`/projects/${projectId}/members/${memberId}`, { role });
      return response;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  },

  /**
   * Remove a member from a project
   */
  remove: async (projectId, memberId) => {
    try {
      const response = await axiosInstance.delete(`/projects/${projectId}/members/${memberId}`);
      return response;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  },
};
