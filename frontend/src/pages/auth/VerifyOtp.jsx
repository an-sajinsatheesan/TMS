import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { verifyOtp as verifyOtpAction, register as registerAction, clearError } from '../../store/slices/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { verifyOtpSchema } from '../../utils/validationSchemas';
import { toast } from '../../hooks/useToast.jsx';
import AuthLayout from './AuthLayout';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const email = location.state?.email || '';
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: yupResolver(verifyOtpSchema),
    defaultValues: {
      code: ''
    }
  });

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(verifyOtpAction({ email, code: data.code })).unwrap();

      toast.success('Email verified successfully!', {
        description: 'Please complete your profile to continue'
      });

      // Navigate to complete profile
      navigate('/complete-profile', {
        state: { email },
        replace: true
      });
    } catch (err) {
      toast.error('Verification failed', {
        description: err || 'Invalid or expired OTP code'
      });

      setError('root', {
        type: 'manual',
        message: err || 'Verification failed'
      });
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resending) return;

    setResending(true);
    try {
      await dispatch(registerAction(email)).unwrap();

      toast.success('OTP sent!', {
        description: 'Please check your email for the new code'
      });

      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      toast.error('Failed to resend OTP', {
        description: err || 'Please try again'
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Verify your email</h1>
          <p className="text-gray-600">
            We sent a verification code to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {/* Error Alert */}
        {(errors.root || error) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.root?.message || error}</AlertDescription>
          </Alert>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* OTP Code Field */}
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              autoFocus
              maxLength={6}
              {...register('code')}
              className={cn(
                "text-center text-2xl tracking-widest",
                errors.code && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={loading}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-sm text-primary hover:underline font-medium"
              disabled={resending || loading}
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend code in {resendTimer}s
            </p>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to register
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtp;
