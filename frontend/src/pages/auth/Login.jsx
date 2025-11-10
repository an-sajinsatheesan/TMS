import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { login as loginAction, clearError } from '../../store/slices/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginSchema } from '../../utils/validationSchemas';
import { toast } from '../../hooks/useToast.jsx';
import AuthLayout from './AuthLayout';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, error, onboardingStatus } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    // Get invitation context from location state
    const invitationMessage = location.state?.message;
    const invitationRedirect = location.state?.redirectTo;
    const prefillEmail = location.state?.email || '';

    const { register, handleSubmit, formState: { errors }, setError } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: prefillEmail,
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const result = await dispatch(loginAction({ email: data.email, password: data.password })).unwrap();

            toast.success('Login successful!', {
                description: 'Welcome back!'
            });

            // If coming from invitation, redirect to the specified path
            if (invitationRedirect) {
                setTimeout(() => {
                    navigate(invitationRedirect, { replace: true });
                }, 300);
            }
            // Check onboarding status and redirect accordingly
            else if (result?.onboardingStatus && !result.onboardingStatus.isComplete) {
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
                const redirectPath = stepMap[result.onboardingStatus.currentStep] || '/onboarding';
                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 300);
            } else {
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 300);
            }
        } catch (err) {
            toast.error('Login failed', {
                description: err || 'Please check your credentials'
            });

            setError('root', {
                type: 'manual',
                message: err || 'Login failed'
            });
        }
    };

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    return (
        <AuthLayout>
            <div className="w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back</h1>
                    <p className="text-gray-600">Sign in to your account to continue</p>
                </div>

                {/* Invitation Success Message */}
                {invitationMessage && (
                    <Alert className="mb-6 border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{invitationMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Error Alert */}
                {(errors.root || error) && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.root?.message || error}</AlertDescription>
                    </Alert>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            autoFocus
                            {...register('email')}
                            className={cn(
                                errors.email && "border-red-500 focus-visible:ring-red-500"
                            )}
                            disabled={loading}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-primary hover:underline"
                                disabled={loading}
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                {...register('password')}
                                className={cn(
                                    "pr-10",
                                    errors.password && "border-red-500 focus-visible:ring-red-500"
                                )}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                {/* Divider */}
                <div className="my-6">
                    <Separator />
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500 -mt-3">
                            Or
                        </span>
                    </div>
                </div>

                {/* Register Link */}
                <div className="text-center text-sm">
                    <span className="text-gray-600">Don't have an account? </span>
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="text-primary hover:underline font-medium"
                        disabled={loading}
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
