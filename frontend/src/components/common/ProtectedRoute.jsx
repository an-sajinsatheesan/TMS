import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, onboardingStatus } = useAuth();
    const location = useLocation();

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

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if onboarding is incomplete and redirect to the correct step
    if (onboardingStatus && !onboardingStatus.isComplete && !location.pathname.startsWith('/onboarding')) {
        const stepMap = {
            1: '/onboarding',
            2: '/onboarding/step2',
            3: '/onboarding/step3',
            4: '/onboarding/step4',
            5: '/onboarding/step5',
            6: '/onboarding/step6',
            7: '/onboarding/step7',
            8: '/onboarding/step8',
            9: '/onboarding/step9',
        };
        const redirectPath = stepMap[onboardingStatus.currentStep] || '/onboarding';
        return <Navigate to={redirectPath} replace />;
    }

    // Case 5: If onboarding is complete and trying to access onboarding, redirect to dashboard
    // The dashboard will load the user's default project
    if (onboardingStatus?.isComplete && location.pathname.startsWith('/onboarding')) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
