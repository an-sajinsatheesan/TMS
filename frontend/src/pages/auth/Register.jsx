import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { registerSchema } from '../../utils/validationSchemas';
import AuthLayout from './AuthLayout';

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const response = await registerUser(data.email);

            // Check if user already exists and is verified
            if (response.data?.userExists && response.data?.isEmailVerified) {
                // If user can continue onboarding directly (no password set)
                if (response.data?.canContinueOnboarding) {
                    // Store tokens and navigate to onboarding
                    if (response.data.tokens) {
                        localStorage.setItem('accessToken', response.data.tokens.accessToken);
                        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
                    }
                    navigate('/onboarding');
                } else if (!response.data?.onboardingComplete) {
                    // If onboarding is not complete but password is set, show message to login
                    setError('root', {
                        type: 'manual',
                        message: response.data.message || 'This email is already registered. Please log in to continue your setup.'
                    });
                } else {
                    // If onboarding is complete, show message to login
                    setError('root', {
                        type: 'manual',
                        message: response.data.message || 'User already exists. Please login.'
                    });
                }
            } else {
                // New user or unverified user - proceed to OTP verification
                navigate('/verify-otp', { state: { email: data.email } });
            }
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.message || 'Registration failed'
            });
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create your account</h1>
                    <p className="text-gray-600">Get started with your free account today</p>
                </div>

                {/* Google Sign Up Button */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {/* Handle Google OAuth */}}
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                    </div>
                </div>

                {/* Error Alert */}
                {errors.root && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            {...register('email')}
                            className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Creating account...' : 'Continue'}
                    </Button>
                </form>

                {/* Terms and Privacy */}
                <p className="mt-4 text-xs text-center text-gray-500">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="underline hover:text-gray-700">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="underline hover:text-gray-700">
                        Privacy Policy
                    </a>
                </p>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Button
                            type="button"
                            variant="link"
                            className="px-0"
                            onClick={() => navigate('/login')}
                        >
                            Sign in
                        </Button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
