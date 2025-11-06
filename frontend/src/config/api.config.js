export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google',
    ME: '/auth/me',
    ONBOARDING_STATUS: '/auth/onboarding-status',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // Onboarding
  ONBOARDING: {
    BASE: '/onboarding',
    PROGRESS: '/onboarding/progress',
    PROFILE: '/onboarding/profile',
    ROLE_INFO: '/onboarding/role-info',
    PROJECT_SETUP: '/onboarding/project-setup',
    LAYOUT: '/onboarding/layout',
    COMPLETE: '/onboarding/complete',
  },
  // Tenants
  TENANTS: {
    LIST: '/tenants',
    SETTINGS: (tenantId) => `/tenants/${tenantId}/settings`,
  },
  // Invitations
  INVITATIONS: {
    SEND_TENANT: '/invitations/send-tenant',
    SEND_PROJECT: '/invitations/send-project',
    GET_DETAILS: (token) => `/invitations/${token}`,
    ACCEPT: (token) => `/invitations/accept/${token}`,
    PENDING: '/invitations/pending',
  },
};
