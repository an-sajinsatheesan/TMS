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
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/forgot-password`, {
        email: data.email
      });
      setSuccess(true);
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Failed to send reset email. Please try again.'
      });
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
            <i className="pi pi-check text-green-600 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-normal text-gray-900 mb-3">Check Your Email</h1>
          <p className="text-gray-600 mb-8">
            If an account exists with that email, we've sent you a password reset link.
          </p>
          <Button
            label="Back to Login"
            onClick={() => navigate('/login')}
            className="w-full justify-center bg-blue-600 hover:bg-blue-700 border-blue-600"
          />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <i className="pi pi-lock text-blue-600 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-normal text-gray-900 mb-3">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {errors.root && (
          <div className="mb-6">
            <Message severity="error" text={errors.root.message} className="w-full" />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <InputText
              id="email"
              type="email"
              {...register('email')}
              placeholder=""
              className={classNames('w-full', { 'p-invalid': errors.email })}
              aria-describedby="email-error"
            />
            {errors.email && (
              <small id="email-error" className="p-error">
                {errors.email.message}
              </small>
            )}
          </div>

          <Button
            type="submit"
            label={isSubmitting ? 'Sending...' : 'Send Reset Link'}
            disabled={isSubmitting}
            className="w-full justify-center bg-blue-600 hover:bg-blue-700 border-blue-600"
            loading={isSubmitting}
          />
        </form>

        <div className="mt-6 text-center">
          <Button
            label="← Back to Login"
            link
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-700 font-normal p-0"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
