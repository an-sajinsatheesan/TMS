import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { completeProfile as completeProfileAction, clearError } from '../../store/slices/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const email = location.state?.email || '';
  const fromInvitation = location.state?.fromInvitation || false;
  const invitationToken = location.state?.invitationToken || null;
  const invitationData = location.state?.invitationData || null;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(completeProfileAction({
        email,
        fullName: data.fullName,
        password: data.password
      })).unwrap();

      // Check if user was invited - prioritize backend response over location state
      const backendInvitation = result?.invitation;
      const isInvited = backendInvitation?.isInvited || (fromInvitation && invitationData);

      if (isInvited) {
        // From invitation - user is already authenticated (tokens saved in Redux)
        // Skip onboarding and redirect directly to workspace/project

        // Determine redirect path from backend data or location state
        let redirectPath;
        let tenantName;

        if (backendInvitation && backendInvitation.isInvited) {
          // Use backend data (most reliable)
          const firstTenant = backendInvitation.tenants?.[0];
          const firstProject = backendInvitation.projects?.[0];

          if (firstProject) {
            // User was invited to a specific project
            redirectPath = `/workspace/${firstProject.tenantId}/project/${firstProject.id}`;
            tenantName = firstProject.name;
          } else if (firstTenant) {
            // User was invited to a tenant
            redirectPath = `/workspace/${firstTenant.id}`;
            tenantName = firstTenant.name;
          }
        } else if (invitationData) {
          // Fallback to location state
          if (invitationData.type === 'PROJECT' && invitationData.projectId) {
            redirectPath = `/workspace/${invitationData.tenantId}/project/${invitationData.projectId}`;
            tenantName = invitationData.projectName;
          } else {
            redirectPath = `/workspace/${invitationData.tenantId}`;
            tenantName = invitationData.tenantName;
          }
        }

        toast.success('Welcome aboard!', {
          description: tenantName ? `You've successfully joined ${tenantName}!` : 'Your account has been created!'
        });

        // Use setTimeout to allow toast to show
        setTimeout(() => {
          if (redirectPath) {
            navigate(redirectPath, { replace: true });
          } else {
            // Fallback to dashboard if we couldn't determine the path
            navigate('/dashboard', { replace: true });
          }
        }, 800);
      } else {
        // Normal registration - go to onboarding
        toast.success('Account created successfully!', {
          description: 'Welcome! Let\'s set up your workspace.'
        });

        setTimeout(() => {
          navigate('/onboarding', { replace: true });
        }, 500);
      }
    } catch (err) {
      toast.error('Profile completion failed', {
        description: err || 'Please try again'
      });

      setError('root', {
        type: 'manual',
        message: err || 'Failed to complete profile'
      });
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {fromInvitation ? 'Complete your account' : 'Complete your profile'}
          </h1>
          <p className="text-gray-600">
            {fromInvitation
              ? `Set up your account to join ${invitationData?.tenantName}`
              : 'Just a few more details to get started'}
          </p>
        </div>

        {/* Error Alert */}
        {(errors.root || error) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.root?.message || error}</AlertDescription>
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
              placeholder="Enter your full name"
              autoFocus
              {...register('fullName')}
              className={cn(
                errors.fullName && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={loading}
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
                placeholder="Create a password"
                {...register('password')}
                className={cn(
                  "pr-10",
                  errors.password && "border-red-500 focus-visible:ring-red-500"
                )}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
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
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={cn(
                  "pr-10",
                  errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                )}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
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
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creating account...' : 'Complete Registration'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default CompleteProfile;
