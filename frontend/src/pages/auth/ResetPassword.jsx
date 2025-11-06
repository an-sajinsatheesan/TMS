import { useState, useForm, yupResolver, useNavigate, Password, Button, Message, classNames, axios } from './authImports';
import { useParams } from 'react-router-dom';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import AuthLayout from './AuthLayout';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/reset-password`, {
        token,
        newPassword: data.newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Failed to reset password. The link may have expired.'
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
          <h1 className="text-3xl font-normal text-gray-900 mb-3">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-8">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Button
            label="Go to Login"
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
            <i className="pi pi-key text-blue-600 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-normal text-gray-900 mb-3">Reset Password</h1>
          <p className="text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {errors.root && (
          <div className="mb-6">
            <Message severity="error" text={errors.root.message} className="w-full" />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <Password
              id="newPassword"
              {...register('newPassword')}
              placeholder=""
              className={classNames('w-full', { 'p-invalid': errors.newPassword })}
              inputClassName="w-full"
              toggleMask
              feedback={false}
              aria-describedby="newPassword-error"
            />
            {errors.newPassword && (
              <small id="newPassword-error" className="p-error">
                {errors.newPassword.message}
              </small>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <Password
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder=""
              className={classNames('w-full', { 'p-invalid': errors.confirmPassword })}
              inputClassName="w-full"
              toggleMask
              feedback={false}
              aria-describedby="confirmPassword-error"
            />
            {errors.confirmPassword && (
              <small id="confirmPassword-error" className="p-error">
                {errors.confirmPassword.message}
              </small>
            )}
          </div>

          <Button
            type="submit"
            label={isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
