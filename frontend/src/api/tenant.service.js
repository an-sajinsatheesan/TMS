import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../config/api.config';

export const tenantService = {
  getTenants: async () => {
    return await axiosInstance.get(API_ENDPOINTS.TENANTS.LIST);
  },

  getSettings: async (tenantId) => {
    return await axiosInstance.get(API_ENDPOINTS.TENANTS.SETTINGS(tenantId));
  },

  updateSettings: async (tenantId, data) => {
    return await axiosInstance.patch(API_ENDPOINTS.TENANTS.SETTINGS(tenantId), data);
  },
};
