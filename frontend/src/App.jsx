import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ProjectProvider } from './contexts/ProjectContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

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
import Step3CompanyInfo from './pages/onboarding/Step4CompanyInfo';
import Step4ProjectName from './pages/onboarding/Step5ProjectName';
import Step5Sections from './pages/onboarding/Step6Sections';
import Step6Tasks from './pages/onboarding/Step7Tasks';
import Step7Layout from './pages/onboarding/Step8Layout';
import Step8Invite from './pages/onboarding/Step9Invite';
 
// Dashboard
import Dashboard from './pages/Dashboard';

// Guards
import OnboardingStepGuard from './components/common/OnboardingStepGuard';

// Other Pages
import InvitationAccept from './pages/InvitationAccept';

function App() {
    return (
        <AuthProvider>
            <OnboardingProvider>
                <ProjectProvider>
                    <Router>
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Dashboard />} />
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
                                    <Step3CompanyInfo />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step4" element={
                                <OnboardingStepGuard requiredStep={4}>
                                    <Step4ProjectName />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step5" element={
                                <OnboardingStepGuard requiredStep={5}>
                                    <Step5Sections />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step6" element={
                                <OnboardingStepGuard requiredStep={6}>
                                    <Step6Tasks />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step7" element={
                                <OnboardingStepGuard requiredStep={7}>
                                    <Step7Layout />
                                </OnboardingStepGuard>
                            } />
                            <Route path="step8" element={
                                <OnboardingStepGuard requiredStep={8}>
                                    <Step8Invite />
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
                        <Route
                            path="/dashboard/:userId/:projectId/:viewMode"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/:userId/:projectId"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
                </ProjectProvider>
            </OnboardingProvider>
        </AuthProvider>
    );
}

export default App;
