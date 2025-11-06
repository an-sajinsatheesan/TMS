import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import { authService } from '../../api/auth.service';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, getValues } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(true);
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || err.message || 'Failed to send reset email'
      });
    }
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <div className="w-full">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-600">
              We've sent a password reset link to
            </p>
            <p className="font-medium text-gray-900 mt-1">{getValues('email')}</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </p>
          </div>

          {/* Back to Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>

          {/* Resend Email */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the email?{' '}
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={() => setEmailSent(false)}
              >
                Try again
              </Button>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Forgot password?</h1>
          <p className="text-gray-600">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Error Alert */}
        {errors.root && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="ghost"
            className="px-0"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
