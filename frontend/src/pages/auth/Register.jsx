import { useForm, yupResolver, useNavigate, useAuth, InputText, Button, Message, classNames } from './authImports';
import { registerSchema } from '../../utils/validationSchemas';
import AuthLayout from './AuthLayout';

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const response = await registerUser(data.email);

            // Check if user already exists and is verified
            if (response.data?.userExists && response.data?.isEmailVerified) {
                // If user can continue onboarding directly (no password set)
                if (response.data?.canContinueOnboarding) {
                    // Store tokens and navigate to onboarding
                    if (response.data.tokens) {
                        localStorage.setItem('accessToken', response.data.tokens.accessToken);
                        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
                    }
                    navigate('/onboarding');
                } else if (!response.data?.onboardingComplete) {
                    // If onboarding is not complete but password is set, show message to login
                    setError('root', {
                        type: 'manual',
                        message: response.data.message || 'This email is already registered. Please log in to continue your setup.'
                    });
                } else {
                    // If onboarding is complete, show message to login
                    setError('root', {
                        type: 'manual',
                        message: response.data.message || 'User already exists. Please login.'
                    });
                }
            } else {
                // New user or unverified user - proceed to OTP verification
                navigate('/verify-otp', { state: { email: data.email } });
            }
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.message || 'Registration failed'
            });
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-normal text-gray-900 mb-3">Welcome to Asana!</h1>
                    <p className="text-gray-600 text-base">Get started with your free account</p>
                </div>

                {/* Google Sign Up Button */}
                <Button
                    label="Continue with Google"
                    icon="pi pi-google"
                    className="w-full justify-center mb-6 p-button-outlined border-2"
                    onClick={() => {/* Handle Google OAuth */}}
                />

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {errors.root && (
                    <div className="mb-6">
                        <Message severity="error" text={errors.root.message} className="w-full" />
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
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
                        label={isSubmitting ? 'Loading...' : 'Continue'}
                        disabled={isSubmitting}
                        className="w-full justify-center bg-blue-600 hover:bg-blue-700 border-blue-600"
                        loading={isSubmitting}
                    />
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Button
                            label="Log In"
                            link
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:text-blue-700 font-normal p-0 underline"
                        />
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
