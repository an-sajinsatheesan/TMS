import axiosInstance from '../../api/axios.instance';

export const teamsService = {
  /**
   * Get all teams
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/teams');
      return response;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  /**
   * Get team by ID
   */
  getById: async (teamId) => {
    try {
      const response = await axiosInstance.get(`/teams/${teamId}`);
      return response;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  },

  /**
   * Create a new team
   */
  create: async (teamData) => {
    try {
      const response = await axiosInstance.post('/teams', teamData);
      return response;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  /**
   * Update team
   */
  update: async (teamId, updates) => {
    try {
      const response = await axiosInstance.patch(`/teams/${teamId}`, updates);
      return response;
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  /**
   * Delete team
   */
  delete: async (teamId) => {
    try {
      const response = await axiosInstance.delete(`/teams/${teamId}`);
      return response;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  /**
   * Get team members
   */
  getMembers: async (teamId) => {
    try {
      const response = await axiosInstance.get(`/teams/${teamId}/members`);
      return response;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  /**
   * Get available members (workspace members not in team)
   */
  getAvailableMembers: async (teamId) => {
    try {
      const response = await axiosInstance.get(`/teams/${teamId}/available-members`);
      return response;
    } catch (error) {
      console.error('Error fetching available members:', error);
      throw error;
    }
  },

  /**
   * Add team member
   */
  addMember: async (teamId, memberData) => {
    try {
      const response = await axiosInstance.post(`/teams/${teamId}/members`, memberData);
      return response;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  /**
   * Update team member role
   */
  updateMemberRole: async (teamId, memberId, role) => {
    try {
      const response = await axiosInstance.patch(`/teams/${teamId}/members/${memberId}`, { role });
      return response;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  },

  /**
   * Remove team member
   */
  removeMember: async (teamId, memberId) => {
    try {
      const response = await axiosInstance.delete(`/teams/${teamId}/members/${memberId}`);
      return response;
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  },
};
