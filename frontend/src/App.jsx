import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ProjectProvider } from './contexts/ProjectContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Onboarding Pages
import OnboardingLayout from './pages/onboarding/OnboardingLayout';
import Step1Welcome from './pages/onboarding/Step1Welcome';
import Step2CreateWorkspace from './pages/onboarding/Step2CreateWorkspace';
import Step3Profile from './pages/onboarding/Step3Profile';
import Step4CompanyInfo from './pages/onboarding/Step4CompanyInfo';
import Step5ProjectName from './pages/onboarding/Step5ProjectName';
import Step6Sections from './pages/onboarding/Step6Sections';
import Step7Tasks from './pages/onboarding/Step7Tasks';
import Step8Layout from './pages/onboarding/Step8Layout';
import Step9Invite from './pages/onboarding/Step9Invite';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Workspace from './pages/dashboard/Workspace';

// Project Pages
import ProjectBoard from './pages/projects/ProjectBoard';

// Other Pages
import InvitationAccept from './pages/InvitationAccept';

function App() {
    return (
        <AuthProvider>
            <OnboardingProvider>
                <ProjectProvider>
                    <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/verify-otp" element={<VerifyOtp />} />
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
                            <Route index element={<Step1Welcome />} />
                            <Route path="step2" element={<Step2CreateWorkspace />} />
                            <Route path="step3" element={<Step3Profile />} />
                            <Route path="step4" element={<Step4CompanyInfo />} />
                            <Route path="step5" element={<Step5ProjectName />} />
                            <Route path="step6" element={<Step6Sections />} />
                            <Route path="step7" element={<Step7Tasks />} />
                            <Route path="step8" element={<Step8Layout />} />
                            <Route path="step9" element={<Step9Invite />} />
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
                        <Route
                            path="/workspace/:tenantId"
                            element={
                                <ProtectedRoute>
                                    <Workspace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/:userId/project/:projectId/:viewMode"
                            element={
                                <ProtectedRoute>
                                    <ProjectBoard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/:userId/project/:projectId"
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
                </Router>
                </ProjectProvider>
            </OnboardingProvider>
        </AuthProvider>
    );
}

export default App;
