import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginSchema } from '../../utils/validationSchemas';
import AuthLayout from './AuthLayout';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const response = await login(data.email, data.password);

            // Check onboarding status and redirect accordingly
            const onboardingStatus = response.data?.onboardingStatus;

            if (onboardingStatus && !onboardingStatus.isComplete) {
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
                navigate(redirectPath, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || err.message || 'Login failed. Please try again.'
            });
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Welcome to TMS</h1>
                    <p className="text-gray-600 text-base">To get started, please sign in</p>
                </div>

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">Sign in with email</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {errors.root && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={cn({ 'border-destructive': errors.email })}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register('password')}
                                className={cn({ 'border-destructive': errors.password })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-normal"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? 'Signing in...' : 'Continue'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-blue-600 hover:text-blue-700 font-normal underline"
                        >
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
