import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * OnboardingStepGuard - Prevents users from accessing onboarding steps out of order
 * Case 4: Ensures onboarding always starts from /onboarding and follows proper step order
 */
const OnboardingStepGuard = ({ children, requiredStep }) => {
  const { onboardingStatus, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !onboardingStatus) return;

    // If onboarding is complete, redirect to dashboard
    if (onboardingStatus.isComplete) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const currentStep = onboardingStatus.currentStep || 1;

    // Allow users to access current step or next step (currentStep + 1)
    // But prevent skipping multiple steps ahead
    if (requiredStep > currentStep + 1) {
      const stepMap = {
        1: '/onboarding',
        2: '/onboarding/step2',
        3: '/onboarding/step3',
        4: '/onboarding/step4',
        5: '/onboarding/step5',
        6: '/onboarding/step6',
        7: '/onboarding/step7',
        8: '/onboarding/step8',
      };
      const redirectPath = stepMap[currentStep] || '/onboarding';

      // Only redirect if we're not already on the correct path
      if (location.pathname !== redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [onboardingStatus, loading, requiredStep, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default OnboardingStepGuard;
