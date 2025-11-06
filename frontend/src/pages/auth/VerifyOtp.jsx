import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { verifyOtpSchema } from '../../utils/validationSchemas';
import { authService } from '../../api/auth.service';
import AuthLayout from './AuthLayout';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(verifyOtpSchema),
    defaultValues: {
      code: ''
    }
  });

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const onSubmit = async (data) => {
    try {
      const response = await authService.verifyOtp(email, data.code);
      console.log('OTP Verification response:', response.data);

      // Extract tokens from response
      const tokens = response.data?.data?.tokens || response.data?.tokens;

      if (tokens?.accessToken && tokens?.refreshToken) {
        // Store tokens in localStorage for persistent authentication
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }

      // After OTP verification, redirect to complete profile
      // User now has valid token from OTP verification
      navigate('/complete-profile', {
        state: {
          email: email,
          accessToken: tokens?.accessToken
        },
        replace: true
      });
    } catch (err) {
      console.error('OTP Verification error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || err.message || 'Verification failed'
      });
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    // TODO: Implement resend OTP API call
    setResendTimer(60);
    setCanResend(false);
  };

  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600">
            We've sent a verification code to
          </p>
          <p className="font-medium text-gray-900 mt-1">{email}</p>
        </div>

        {/* Error Alert */}
        {errors.root && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              maxLength={6}
              autoFocus
              {...register('code')}
              className={cn(
                "text-center text-2xl tracking-[0.5em] font-mono",
                errors.code && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          {canResend ? (
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={handleResend}
            >
              Resend code
            </Button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend code in {resendTimer}s
            </p>
          )}
        </div>

        {/* Back to Registration */}
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            className="px-0"
            onClick={() => navigate('/register')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to registration
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtp;
