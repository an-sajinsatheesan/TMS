import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { register as registerAction, clearError } from '../../store/slices/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { registerSchema } from '../../utils/validationSchemas';
import { toast } from '../../hooks/useToast.jsx';
import AuthLayout from './AuthLayout';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors }, setError } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            await dispatch(registerAction(data.email)).unwrap();

            toast.success('Registration successful!', {
                description: 'Please check your email for the OTP code'
            });

            // Navigate to OTP verification
            navigate('/verify-otp', {
                state: { email: data.email },
                replace: true
            });
        } catch (err) {
            toast.error('Registration failed', {
                description: err || 'Please try again'
            });

            setError('root', {
                type: 'manual',
                message: err || 'Registration failed'
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
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create your account</h1>
                    <p className="text-gray-600">Get started with your free account</p>
                </div>

                {/* Error Alert */}
                {(errors.root || error) && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.root?.message || error}</AlertDescription>
                    </Alert>
                )}

                {/* Register Form */}
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

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Sending OTP...' : 'Continue with Email'}
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

                {/* Login Link */}
                <div className="text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-primary hover:underline font-medium"
                        disabled={loading}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
