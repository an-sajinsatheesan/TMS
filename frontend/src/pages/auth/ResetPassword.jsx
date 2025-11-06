import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import { authService } from '../../api/auth.service';
import AuthLayout from './AuthLayout';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            await authService.resetPassword(token, data.newPassword);
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Failed to reset password'
            });
        }
    };

    if (isSuccess) {
        return (
            <AuthLayout>
                <div className="w-full text-center">
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Password Reset Successful!</h1>
                    <p className="text-gray-600 text-base mb-6">
                        Redirecting to login...
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Reset Password</h1>
                    <p className="text-gray-600 text-base">Enter your new password</p>
                </div>

                {errors.root && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                {...register('newPassword')}
                                className={cn({ 'border-destructive': errors.newPassword })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register('confirmPassword')}
                                className={cn({ 'border-destructive': errors.confirmPassword })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;
