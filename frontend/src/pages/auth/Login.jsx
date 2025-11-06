import React from "react";
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginSchema } from '../../utils/validationSchemas';
import AuthLayout from './AuthLayout';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            console.log('Attempting login with:', { email: data.email });
            const response = await login(data.email, data.password);
            console.log('Login successful');

            // Check onboarding status and redirect accordingly
            const onboardingStatus = response.data?.onboardingStatus;

            if (onboardingStatus && !onboardingStatus.isComplete) {
                // Map current step to onboarding route
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
                console.log('Redirecting to onboarding:', redirectPath);
                navigate(redirectPath, { replace: true });
            } else {
                console.log('Navigating to /dashboard');
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
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
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Welcome to Asana</h1>
                    <p className="text-gray-600 text-base">To get started, please sign in</p>
                </div>

                {/* Google Sign In Button */}
                <Button
                    label="Continue with Google"
                    icon="pi pi-google"
                    className="w-full justify-center mb-6 p-button-outlined border-2"
                    onClick={() => {/* Handle Google OAuth */}}
                />

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {errors.root && (
                    <div className="mb-6">
                        <Message severity="error" text={errors.root.message} className="w-full" />
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <InputText
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder=""
                            className={classNames('w-full', { 'p-invalid': errors.email })}
                            aria-describedby="email-error"
                        />
                        {errors.email && (
                            <small id="email-error" className="p-error">
                                {errors.email.message}
                            </small>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <Password
                            id="password"
                            inputRef={register('password').ref}
                            name={register('password').name}
                            onChange={register('password').onChange}
                            onBlur={register('password').onBlur}
                            className={classNames('w-full', { 'p-invalid': errors.password })}
                            inputClassName="w-full"
                            placeholder=""
                            toggleMask
                            feedback={false}
                            aria-describedby="password-error"
                        />
                        {errors.password && (
                            <small id="password-error" className="p-error">
                                {errors.password.message}
                            </small>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <Button
                            label="Forgot Password?"
                            link
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-normal p-0"
                        />
                    </div>

                    <Button
                        type="submit"
                        label={isSubmitting ? 'Signing in...' : 'Continue'}
                        disabled={isSubmitting}
                        className="w-full justify-center bg-blue-600 hover:bg-blue-700 border-blue-600"
                        loading={isSubmitting}
                    />
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Button
                            label="Sign Up"
                            link
                            onClick={() => navigate('/register')}
                            className="text-blue-600 hover:text-blue-700 font-normal p-0 underline"
                        />
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;