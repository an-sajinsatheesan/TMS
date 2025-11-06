import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import { authService } from '../../api/auth.service';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(forgotPasswordSchema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            await authService.forgotPassword(data.email);
            navigate('/login', { state: { message: 'Password reset link sent to your email' } });
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Failed to send reset link'
            });
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Forgot Password?</h1>
                    <p className="text-gray-600 text-base">
                        Enter your email and we'll send you a reset link
                    </p>
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

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
