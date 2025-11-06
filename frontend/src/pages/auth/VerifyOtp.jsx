import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { verifyOtpSchema } from '../../utils/validationSchemas';
import AuthLayout from './AuthLayout';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(verifyOtpSchema),
    defaultValues: {
      code: ''
    }
  });

  const email = location.state?.email;

  const onSubmit = async (data) => {
    try {
      await verifyOtp(email, data.code);
      navigate('/onboarding');
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Verification failed'
      });
    }
  };

  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <AuthLayout>
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-normal text-gray-900 mb-3">Verify Email</h1>
          <p className="text-gray-600">
            We've sent a verification code to<br />
            <strong className="text-gray-900">{email}</strong>
          </p>
        </div>

        {errors.root && (
          <div className="mb-6">
            <Message severity="error" text={errors.root.message} className="w-full" />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <InputText
              id="code"
              type="text"
              {...register('code')}
              className={classNames('w-full text-center text-2xl tracking-widest', { 'p-invalid': errors.code })}
              placeholder="000000"
              maxLength={6}
              autoFocus
              aria-describedby="code-error"
            />
            {errors.code && (
              <small id="code-error" className="p-error">
                {errors.code.message}
              </small>
            )}
            <p className="mt-2 text-xs text-gray-500">Check your email for the 6-digit code</p>
          </div>

          <Button
            type="submit"
            label={isSubmitting ? 'Verifying...' : 'Verify Email'}
            disabled={isSubmitting}
            className="w-full justify-center bg-blue-600 hover:bg-blue-700 border-blue-600"
            loading={isSubmitting}
          />
        </form>

        <div className="mt-6 text-center">
          <Button
            label="← Back to Registration"
            link
            onClick={() => navigate('/register')}
            className="text-sm text-blue-600 hover:text-blue-700 font-normal p-0"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtp;
