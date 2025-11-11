import axiosInstance from '../../api/axios.instance';

export const tenantsService = {
  /**
   * Get all tenants (workspaces) for the current user
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/tenants');
      return response;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  /**
   * Get a single tenant by ID
   */
  getById: async (tenantId) => {
    try {
      const response = await axiosInstance.get(`/tenants/${tenantId}`);
      return response;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      throw error;
    }
  },

  /**
   * Get tenant settings
   */
  getSettings: async (tenantId) => {
    try {
      const response = await axiosInstance.get(`/tenants/${tenantId}/settings`);
      return response;
    } catch (error) {
      console.error('Error fetching tenant settings:', error);
      throw error;
    }
  },

  /**
   * Update tenant settings
   */
  updateSettings: async (tenantId, settings) => {
    try {
      const response = await axiosInstance.patch(`/tenants/${tenantId}/settings`, settings);
      return response;
    } catch (error) {
      console.error('Error updating tenant settings:', error);
      throw error;
    }
  },

  /**
   * Get tenant members (from tenant_users)
   */
  getMembers: async (tenantId) => {
    try {
      const response = await axiosInstance.get(`/tenants/${tenantId}/members`);
      return response;
    } catch (error) {
      console.error('Error fetching tenant members:', error);
      throw error;
    }
  },

  /**
   * Invite members to tenant
   */
  inviteMembers: async (tenantId, inviteData) => {
    try {
      const response = await axiosInstance.post(`/invitations/send-tenant`, {
        tenantId,
        ...inviteData,
      });
      return response;
    } catch (error) {
      console.error('Error inviting tenant members:', error);
      throw error;
    }
  },

  /**
   * Update tenant member role
   */
  updateMemberRole: async (tenantId, userId, role) => {
    try {
      const response = await axiosInstance.patch(`/tenants/${tenantId}/members/${userId}`, { role });
      return response;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  },

  /**
   * Remove member from tenant
   */
  removeMember: async (tenantId, userId) => {
    try {
      const response = await axiosInstance.delete(`/tenants/${tenantId}/members/${userId}`);
      return response;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  },
};
