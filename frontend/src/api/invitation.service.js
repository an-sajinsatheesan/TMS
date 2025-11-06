import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../config/api.config';

export const invitationService = {
  /**
   * Send tenant-level invitations
   * @param {string} tenantId - The tenant ID
   * @param {string[]} emails - Array of email addresses
   * @param {string} role - Role to assign (ADMIN or MEMBER)
   */
  sendTenantInvitations: async (tenantId, emails, role = 'MEMBER') => {
    return await axiosInstance.post(API_ENDPOINTS.INVITATIONS.SEND_TENANT, {
      tenantId,
      emails,
      role
    });
  },

  /**
   * Send project-level invitations
   * @param {string} projectId - The project ID
   * @param {string[]} emails - Array of email addresses
   */
  sendProjectInvitations: async (projectId, emails) => {
    return await axiosInstance.post(API_ENDPOINTS.INVITATIONS.SEND_PROJECT, {
      projectId,
      emails
    });
  },

  /**
   * Get invitation details by token
   * @param {string} token - The invitation token
   */
  getInvitationDetails: async (token) => {
    return await axiosInstance.get(API_ENDPOINTS.INVITATIONS.GET_DETAILS(token));
  },

  /**
   * Accept invitation
   * @param {string} token - The invitation token
   */
  acceptInvitation: async (token) => {
    return await axiosInstance.post(API_ENDPOINTS.INVITATIONS.ACCEPT(token));
  },

  /**
   * Get pending invitations for current user
   */
  getPendingInvitations: async () => {
    return await axiosInstance.get(API_ENDPOINTS.INVITATIONS.PENDING);
  },
};
