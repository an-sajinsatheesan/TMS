import axiosInstance from './axios.instance';
import { API_ENDPOINTS } from '../config/api.config';

export const authService = {
  register: async (email) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, { email });
  },

  verifyOtp: async (email, code) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, code });
  },

  login: async (email, password) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  },

  googleLogin: async (googleToken) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { googleToken });
  },

  getCurrentUser: async () => {
    return await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
  },

  getOnboardingStatus: async () => {
    return await axiosInstance.get(API_ENDPOINTS.AUTH.ONBOARDING_STATUS);
  },

  forgotPassword: async (email) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (token, newPassword) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  },
};
