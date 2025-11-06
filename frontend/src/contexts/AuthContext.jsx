import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [onboardingStatus, setOnboardingStatus] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const response = await authService.getCurrentUser();
                setUser(response.data.user);

                // Fetch onboarding status
                try {
                    const statusResponse = await authService.getOnboardingStatus();
                    if (statusResponse.success) {
                        setOnboardingStatus(statusResponse.data.onboardingStatus);
                    }
                } catch (err) {
                    console.error('Failed to fetch onboarding status:', err);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        if (response.success) {
            localStorage.setItem('accessToken', response.data.tokens.accessToken);
            localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
            setUser(response.data.user);
            setOnboardingStatus(response.data.onboardingStatus);
        }
        return response;
    };

    const register = async (email) => {
        const response = await authService.register(email);

        // If user can continue onboarding, set user and tokens
        if (response.data?.canContinueOnboarding && response.data?.user) {
            setUser(response.data.user);
            if (response.data.onboardingStatus) {
                setOnboardingStatus(response.data.onboardingStatus);
            } else if (response.data.currentStep) {
                // Set onboarding status from response
                setOnboardingStatus({
                    isComplete: false,
                    currentStep: response.data.currentStep
                });
            }
        }

        return response;
    };

    const verifyOtp = async (email, code) => {
        const response = await authService.verifyOtp(email, code);
        if (response.success) {
            localStorage.setItem('accessToken', response.data.tokens.accessToken);
            localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
            setUser(response.data.user);
        }
        return response;
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const refreshOnboardingStatus = async () => {
        try {
            const statusResponse = await authService.getOnboardingStatus();
            if (statusResponse.success) {
                setOnboardingStatus(statusResponse.data.onboardingStatus);
            }
        } catch (err) {
            console.error('Failed to refresh onboarding status:', err);
        }
    };

    const value = {
        user,
        loading,
        onboardingStatus,
        login,
        register,
        verifyOtp,
        logout,
        checkAuth,
        refreshOnboardingStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
