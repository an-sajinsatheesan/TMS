import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { verifyOtpSchema } from '../../utils/validationSchemas';
import { authService } from '../../api/auth.service';
import AuthLayout from './AuthLayout';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(verifyOtpSchema),
        defaultValues: {
            otp: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            await authService.verifyOtp(email, data.otp);
            navigate('/onboarding');
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Invalid OTP'
            });
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Verify Your Email</h1>
                    <p className="text-gray-600 text-base">
                        We sent a code to {email}
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
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                            Verification Code
                        </label>
                        <Input
                            id="otp"
                            type="text"
                            {...register('otp')}
                            className={cn({ 'border-destructive': errors.otp })}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                        />
                        {errors.otp && (
                            <p className="text-sm text-destructive">{errors.otp.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Verifying...' : 'Verify'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Didn't receive the code?{' '}
                        <button type="button" className="text-blue-600 hover:text-blue-700">
                            Resend
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyOtp;
