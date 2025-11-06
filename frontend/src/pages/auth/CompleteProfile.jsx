import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '../../api/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/useToast.jsx';
import AuthLayout from './AuthLayout';

const profileSchema = yup.object().shape({
  fullName: yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeProfile } = useAuth();
  const email = location.state?.email || '';
  const accessToken = location.state?.accessToken || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    if (!accessToken) {
      setError('root', {
        type: 'manual',
        message: 'Invalid session. Please register again.'
      });
      navigate('/register');
      return;
    }

    try {
      await completeProfile(accessToken, {
        fullName: data.fullName,
        password: data.password
      });

      toast.success('Account created successfully! Welcome aboard!', {
        description: 'Redirecting to onboarding...'
      });

      setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('❌ Profile creation error:', err);

      const errorMessage = err.response?.data?.message || err.message || 'Failed to complete profile. Please try again.';
      toast.error('Profile creation failed', {
        description: errorMessage
      });

      setError('root', {
        type: 'manual',
        message: errorMessage
      });
    }
  };

  useEffect(() => {
    if (!email || !accessToken) {
      navigate('/register', { replace: true });
    }
  }, [email, accessToken, navigate]);

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Complete your profile</h1>
          <p className="text-gray-600">
            Set up your account to get started
          </p>
        </div>

        {/* Error Alert */}
        {errors.root && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              autoFocus
              {...register('fullName')}
              className={cn(
                errors.fullName && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register('password')}
                className={cn(
                  "pr-10",
                  errors.password && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                {...register('confirmPassword')}
                className={cn(
                  "pr-10",
                  errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating account...' : 'Complete registration'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default CompleteProfile;
