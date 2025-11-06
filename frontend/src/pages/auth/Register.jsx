import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
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
            await registerUser(data.email);
            navigate('/verify-otp', { state: { email: data.email } });
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || err.message || 'Registration failed'
            });
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Create an Account</h1>
                    <p className="text-gray-600 text-base">Get started with your free account</p>
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
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Creating account...' : 'Continue'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:text-blue-700 font-normal underline"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
