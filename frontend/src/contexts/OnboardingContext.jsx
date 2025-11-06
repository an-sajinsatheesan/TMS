import { createContext, useContext, useState, useEffect } from 'react';
import { onboardingService } from '../api/onboarding.service';
import { useAuth } from './AuthContext';

const OnboardingContext = createContext(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const { onboardingStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Sync with backend onboarding status
  useEffect(() => {
    if (onboardingStatus?.currentStep) {
      setCurrentStep(onboardingStatus.currentStep);
    }
  }, [onboardingStatus]);
  const [onboardingData, setOnboardingData] = useState({
    profile: {},
    appUsage: {},
    industry: {},
    teamSize: {},
    roleInfo: {},
    projectSetup: {},
    layout: 'BOARD',
    inviteEmails: [],
  });

  const updateOnboardingData = (step, data) => {
    setOnboardingData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 9));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const saveProfile = async (data) => {
    const response = await onboardingService.saveProfile(data);
    updateOnboardingData('profile', data);
    return response;
  };

  const saveAppUsage = async (data) => {
    const response = await onboardingService.saveAppUsage(data);
    updateOnboardingData('appUsage', data);
    return response;
  };

  const saveIndustry = async (data) => {
    const response = await onboardingService.saveIndustry(data);
    updateOnboardingData('industry', data);
    return response;
  };

  const saveTeamSize = async (data) => {
    const response = await onboardingService.saveTeamSize(data);
    updateOnboardingData('teamSize', data);
    return response;
  };

  const saveRoleInfo = async (data) => {
    const response = await onboardingService.saveRoleInfo(data);
    updateOnboardingData('roleInfo', data);
    return response;
  };

  const saveProjectSetup = async (data) => {
    const response = await onboardingService.saveProjectSetup(data);
    updateOnboardingData('projectSetup', data);
    return response;
  };

  const saveLayout = async (data) => {
    const response = await onboardingService.saveLayout(data);
    updateOnboardingData('layout', data.layout);
    return response;
  };

  const completeOnboarding = async (data) => {
    const response = await onboardingService.complete(data);
    return response;
  };

  const saveCompanyInfo = async (data) => {
    // Save all company info in parallel
    await Promise.all([
      onboardingService.saveAppUsage({ usageIds: data.appUsageIds }),
      onboardingService.saveIndustry({
        industryIds: data.industryIds,
        otherIndustry: data.otherIndustry
      }),
      onboardingService.saveTeamSize({ teamSizeId: data.teamSizeId }),
    ]);

    updateOnboardingData('companyInfo', data);
    return true;
  };

  const saveWorkspace = async (data) => {
    // Just save workspace name locally - it will be created at onboarding completion
    updateOnboardingData('workspace', data);
    return true;
  };

  const value = {
    currentStep,
    onboardingData,
    setCurrentStep,
    nextStep,
    prevStep,
    updateOnboardingData,
    saveProfile,
    saveWorkspace,
    saveAppUsage,
    saveIndustry,
    saveTeamSize,
    saveRoleInfo,
    saveCompanyInfo,
    saveProjectSetup,
    saveLayout,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
