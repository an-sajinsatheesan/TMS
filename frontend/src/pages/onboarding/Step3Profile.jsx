import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import { profileSchema } from '../../utils/validationSchemas';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Step3Profile = () => {
    const navigate = useNavigate();
    const { setCurrentStep, saveProfile } = useOnboarding();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            fullName: '',
            password: '',
            confirmPassword: '',
            avatarUrl: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            debugger
            await saveProfile({
                fullName: data.fullName,
                password: data.password,
                avatarUrl: data.avatarUrl || undefined,
            });
            setCurrentStep(4);
            navigate('/onboarding/step4');
        } catch (err) {
            setError('root', {
                type: 'manual',
                message: err.message || 'Failed to save profile'
            });
        }
    };

    return (
        <div className="card p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Set Up Your Profile</h2>
                <p className="text-gray-600">
                    Tell us a bit about yourself.
                </p>
            </div>

            {errors.root && (
                <div className="mb-4">
                    <Message severity="error" text={errors.root.message} className="w-full" />
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold">
                            Full Name *
                        </label>
                        <InputText
                            id="fullName"
                            {...register('fullName')}
                            className={classNames('w-full', { 'p-invalid': errors.fullName })}
                            placeholder="John Doe"
                            aria-describedby="fullName-error"
                        />
                        {errors.fullName && (
                            <small id="fullName-error" className="p-error">
                                {errors.fullName.message}
                            </small>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold">
                            Password *
                        </label>
                        <Password
                            id="password"
                            inputRef={register('password').ref}
                            name={register('password').name}
                            onChange={register('password').onChange}
                            onBlur={register('password').onBlur}
                            className={classNames('w-full', { 'p-invalid': errors.password })}
                            inputClassName="w-full"
                            placeholder="Create a password"
                            toggleMask
                            aria-describedby="password-error"
                        />
                        {errors.password && (
                            <small id="password-error" className="p-error">
                                {errors.password.message}
                            </small>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold">
                            Confirm Password *
                        </label>
                        <Password
                            id="confirmPassword"
                            inputRef={register('confirmPassword').ref}
                            name={register('confirmPassword').name}
                            onChange={register('confirmPassword').onChange}
                            onBlur={register('confirmPassword').onBlur}
                            className={classNames('w-full', { 'p-invalid': errors.confirmPassword })}
                            inputClassName="w-full"
                            placeholder="Confirm your password"
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

                    <div className="flex flex-col gap-2">
                        <label htmlFor="avatarUrl" className="block text-gray-700 text-sm font-semibold">
                            Avatar URL (Optional)
                        </label>
                        <InputText
                            id="avatarUrl"
                            type="url"
                            {...register('avatarUrl')}
                            className={classNames('w-full', { 'p-invalid': errors.avatarUrl })}
                            placeholder="https://example.com/avatar.jpg"
                            aria-describedby="avatarUrl-error"
                        />
                        {errors.avatarUrl && (
                            <small id="avatarUrl-error" className="p-error">
                                {errors.avatarUrl.message}
                            </small>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/onboarding/step2')}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Continue'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Step3Profile;
