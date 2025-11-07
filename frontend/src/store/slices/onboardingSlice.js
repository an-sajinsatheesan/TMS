import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { onboardingService } from '../../api/onboarding.service';
import { refreshOnboardingStatus } from './authSlice';

// Async thunks for each step
export const updateStep = createAsyncThunk(
  'onboarding/updateStep',
  async (step, { dispatch, rejectWithValue }) => {
    try {
      await onboardingService.updateStep(step);
      await dispatch(refreshOnboardingStatus());
      return step;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update step');
    }
  }
);

export const saveWorkspace = createAsyncThunk(
  'onboarding/saveWorkspace',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await onboardingService.updateStep(3);
      await dispatch(refreshOnboardingStatus());
      return { workspace: data, nextStep: 3 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save workspace');
    }
  }
);

export const saveCompanyInfo = createAsyncThunk(
  'onboarding/saveCompanyInfo',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all([
        onboardingService.saveAppUsage({ usageIds: data.appUsageIds }),
        onboardingService.saveIndustry({
          industryIds: data.industryIds,
          otherIndustry: data.otherIndustry
        }),
        onboardingService.saveTeamSize({ teamSizeId: data.teamSizeId }),
      ]);
      await dispatch(refreshOnboardingStatus());
      return { companyInfo: data, nextStep: 4 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save company info');
    }
  }
);

export const saveProjectName = createAsyncThunk(
  'onboarding/saveProjectName',
  async (projectName, { dispatch, getState, rejectWithValue }) => {
    try {
      // Get existing sections and tasks from state
      const state = getState();
      const sections = state.onboarding.data.projectSetup?.sections || [];
      const tasks = state.onboarding.data.projectSetup?.tasks || [];

      // Save to backend using project-setup endpoint
      await onboardingService.saveProjectSetup({
        projectName,
        sections: sections.map((name, index) => ({ name, position: index })),
        tasks: tasks.map(title => ({ title, sectionName: null }))
      });
      await dispatch(refreshOnboardingStatus());
      return { projectName, nextStep: 5 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save project name');
    }
  }
);

export const saveSections = createAsyncThunk(
  'onboarding/saveSections',
  async (sections, { dispatch, getState, rejectWithValue }) => {
    try {
      // Get existing project name and tasks from state
      const state = getState();
      const projectName = state.onboarding.data.projectSetup?.projectName || 'My First Project';
      const tasks = state.onboarding.data.projectSetup?.tasks || [];

      // Save to backend using project-setup endpoint
      await onboardingService.saveProjectSetup({
        projectName,
        sections: sections.map((name, index) => ({ name, position: index })),
        tasks: tasks.map(title => ({ title, sectionName: null }))
      });
      await dispatch(refreshOnboardingStatus());
      return { sections, nextStep: 6 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save sections');
    }
  }
);

export const saveTasks = createAsyncThunk(
  'onboarding/saveTasks',
  async (tasks, { dispatch, getState, rejectWithValue }) => {
    try {
      // Get existing project name and sections from state
      const state = getState();
      const projectName = state.onboarding.data.projectSetup?.projectName || 'My First Project';
      const sections = state.onboarding.data.projectSetup?.sections || [];

      // Save to backend using project-setup endpoint
      await onboardingService.saveProjectSetup({
        projectName,
        sections: sections.map((name, index) => ({ name, position: index })),
        tasks: tasks.map(title => ({ title, sectionName: null }))
      });
      await dispatch(refreshOnboardingStatus());
      return { tasks, nextStep: 7 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save tasks');
    }
  }
);

export const saveProjectSetup = createAsyncThunk(
  'onboarding/saveProjectSetup',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await onboardingService.saveProjectSetup(data);
      await dispatch(refreshOnboardingStatus());
      return { projectSetup: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save project setup');
    }
  }
);

export const saveLayout = createAsyncThunk(
  'onboarding/saveLayout',
  async (layout, { dispatch, rejectWithValue }) => {
    try {
      await onboardingService.saveLayout({ layout });
      await dispatch(refreshOnboardingStatus());
      return { layout };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save layout');
    }
  }
);

export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async (data, { rejectWithValue }) => {
    try {
      // data should be { inviteEmails: [] }
      const response = await onboardingService.complete(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete onboarding');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    currentStep: 1,
    data: {
      workspace: {},
      companyInfo: {},
      projectSetup: {},
      layout: 'BOARD',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOnboarding: (state) => {
      state.currentStep = 1;
      state.data = {
        workspace: {},
        companyInfo: {},
        projectSetup: {},
        layout: 'BOARD',
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Step
      .addCase(updateStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStep.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStep = action.payload;
      })
      .addCase(updateStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Workspace
      .addCase(saveWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.data.workspace = action.payload.workspace;
        state.currentStep = action.payload.nextStep;
      })
      .addCase(saveWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Company Info
      .addCase(saveCompanyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCompanyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.data.companyInfo = action.payload.companyInfo;
        state.currentStep = action.payload.nextStep;
      })
      .addCase(saveCompanyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Project Name
      .addCase(saveProjectName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProjectName.fulfilled, (state, action) => {
        state.loading = false;
        state.data.projectSetup.projectName = action.payload.projectName;
        state.currentStep = action.payload.nextStep;
      })
      .addCase(saveProjectName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Sections
      .addCase(saveSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSections.fulfilled, (state, action) => {
        state.loading = false;
        state.data.projectSetup.sections = action.payload.sections;
        state.currentStep = action.payload.nextStep;
      })
      .addCase(saveSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Tasks
      .addCase(saveTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.data.projectSetup.tasks = action.payload.tasks;
        state.currentStep = action.payload.nextStep;
      })
      .addCase(saveTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Project Setup
      .addCase(saveProjectSetup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProjectSetup.fulfilled, (state, action) => {
        state.loading = false;
        state.data.projectSetup = action.payload.projectSetup;
      })
      .addCase(saveProjectSetup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Layout
      .addCase(saveLayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveLayout.fulfilled, (state, action) => {
        state.loading = false;
        state.data.layout = action.payload.layout;
      })
      .addCase(saveLayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentStep, clearError, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
