import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../config/api.config';

export const onboardingService = {
  // Fetch options (public endpoints)
  getAllOptions: async () => {
    return await axiosInstance.get(`${API_ENDPOINTS.ONBOARDING.BASE}/options/all`);
  },

  getAppUsageOptions: async () => {
    return await axiosInstance.get(`${API_ENDPOINTS.ONBOARDING.BASE}/options/app-usage`);
  },

  getIndustryOptions: async () => {
    return await axiosInstance.get(`${API_ENDPOINTS.ONBOARDING.BASE}/options/industries`);
  },

  getTeamSizeOptions: async () => {
    return await axiosInstance.get(`${API_ENDPOINTS.ONBOARDING.BASE}/options/team-sizes`);
  },

  getRoleOptions: async () => {
    return await axiosInstance.get(`${API_ENDPOINTS.ONBOARDING.BASE}/options/roles`);
  },

  // Progress
  getProgress: async () => {
    return await axiosInstance.get(API_ENDPOINTS.ONBOARDING.PROGRESS);
  },

  updateStep: async (step) => {
    return await axiosInstance.post(`${API_ENDPOINTS.ONBOARDING.BASE}/update-step`, { step });
  },

  // Save endpoints
  saveProfile: async (data) => {
    return await axiosInstance.post(API_ENDPOINTS.ONBOARDING.PROFILE, data);
  },

  saveAppUsage: async (data) => {
    return await axiosInstance.post(`${API_ENDPOINTS.ONBOARDING.BASE}/app-usage`, data);
  },

  saveIndustry: async (data) => {
    return await axiosInstance.post(`${API_ENDPOINTS.ONBOARDING.BASE}/industry`, data);
  },

  saveTeamSize: async (data) => {
    return await axiosInstance.post(`${API_ENDPOINTS.ONBOARDING.BASE}/team-size`, data);
  },

  saveRoleInfo: async (data) => {
    return await axiosInstance.post(API_ENDPOINTS.ONBOARDING.ROLE_INFO, data);
  },

  saveProjectSetup: async (data) => {
    return await axiosInstance.post(API_ENDPOINTS.ONBOARDING.PROJECT_SETUP, data);
  },

  saveLayout: async (data) => {
    return await axiosInstance.post(API_ENDPOINTS.ONBOARDING.LAYOUT, data);
  },

  complete: async (data) => {
    return await axiosInstance.post(API_ENDPOINTS.ONBOARDING.COMPLETE, data);
  },
};
