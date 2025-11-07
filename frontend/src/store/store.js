import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import listViewReducer from './slices/listViewSlice';
import columnsReducer from './slices/columnsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    listView: listViewReducer,
    columns: columnsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/checkAuth/fulfilled'],
      },
    }),
});
