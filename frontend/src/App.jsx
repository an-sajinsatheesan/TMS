import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthInit from './components/common/AuthInit';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ProjectProvider } from './contexts/ProjectContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import { toast } from './hooks/useToast';

// Auth Pages
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyOtp from './pages/auth/VerifyOtp';
import CompleteProfile from './pages/auth/CompleteProfile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Onboarding Pages
import OnboardingLayout from './pages/onboarding/OnboardingLayout';
import Step1Welcome from './pages/onboarding/Step1Welcome';
import Step2CreateWorkspace from './pages/onboarding/Step2CreateWorkspace';
import Step4CompanyInfo from './pages/onboarding/Step4CompanyInfo';
import Step5ProjectName from './pages/onboarding/Step5ProjectName';
import Step6Sections from './pages/onboarding/Step6Sections';
import Step7Tasks from './pages/onboarding/Step7Tasks';
import Step8Layout from './pages/onboarding/Step8Layout';
import Step9Invite from './pages/onboarding/Step9Invite';
 
// Dashboard
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import Projects from './pages/Projects';
import Favorites from './pages/Favorites';
import Teams from './pages/Teams';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';

// Guards
import OnboardingStepGuard from './components/common/OnboardingStepGuard';

// Other Pages
import InvitationAccept from './pages/InvitationAccept';

function App() {
    useEffect(() => {
        // Listen for session expiration events
        const handleSessionExpired = (event) => {
            const message = event.detail?.message || 'Your session has expired. Please log in again.';
            toast.warning(message, { duration: 5000 });
        };

        window.addEventListener('session-expired', handleSessionExpired);

        return () => {
            window.removeEventListener('session-expired', handleSessionExpired);
        };
    }, []);

    return (
        <AuthProvider>
            <OnboardingProvider>
                <ProjectProvider>
                    <Router>
                    <AuthInit>
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/verify-otp" element={<VerifyOtp />} />
                        <Route path="/complete-profile" element={<CompleteProfile />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/invitation/accept/:token" element={<InvitationAccept />} />
                        <Route path="/accept-invitation/:token" element={<InvitationAccept />} />

                        {/* Protected Onboarding Routes */}
                        <Route
                            path="/onboarding"
                            element={
                                <ProtectedRoute>
                                    <OnboardingLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={
                                <OnboardingStepGuard requiredStep={1}>
                                    <Step1Welcome />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step2" element={
                                <OnboardingStepGuard requiredStep={2}>
                                    <Step2CreateWorkspace />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step3" element={
                                <OnboardingStepGuard requiredStep={3}>
                                    <Step4CompanyInfo />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step4" element={
                                <OnboardingStepGuard requiredStep={4}>
                                    <Step5ProjectName />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step5" element={
                                <OnboardingStepGuard requiredStep={5}>
                                    <Step6Sections />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step6" element={
                                <OnboardingStepGuard requiredStep={6}>
                                    <Step7Tasks />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step7" element={
                                <OnboardingStepGuard requiredStep={7}>
                                    <Step8Layout />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step8" element={
                                <OnboardingStepGuard requiredStep={8}>
                                    <Step9Invite />
                                </OnboardingStepGuard>
                            } />
                        </Route>

                        {/* Protected Dashboard Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Projects Routes */}
                        <Route
                            path="/projects"
                            element={
                                <ProtectedRoute>
                                    <Projects />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Favorites Routes */}
                        <Route
                            path="/favorites"
                            element={
                                <ProtectedRoute>
                                    <Favorites />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Teams Routes */}
                        <Route
                            path="/teams"
                            element={
                                <ProtectedRoute>
                                    <Teams />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Analytics Routes */}
                        <Route
                            path="/analytics"
                            element={
                                <ProtectedRoute>
                                    <Analytics />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Notifications Routes */}
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Project Board Routes */}
                        <Route
                            path="/project-board/:userId/:projectId/:viewMode"
                            element={
                                <ProtectedRoute>
                                    <ProjectBoard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/project-board/:userId/:projectId"
                            element={
                                <ProtectedRoute>
                                    <ProjectBoard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                    </AuthInit>
                </Router>
                </ProjectProvider>
            </OnboardingProvider>
        </AuthProvider>
    );
}

export default App;
