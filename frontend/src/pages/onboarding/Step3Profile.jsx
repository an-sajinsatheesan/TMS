import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { profileSchema } from '../../utils/validationSchemas';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const Step3Profile = () => {
    const navigate = useNavigate();
    const { setCurrentStep, saveProfile } = useOnboarding();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Set Up Your Profile</h2>
                <p className="text-gray-600">
                    Tell us a bit about yourself.
                </p>
            </div>

            {errors.root && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="fullName" className="block text-sm font-semibold">
                            Full Name *
                        </label>
                        <Input
                            id="fullName"
                            {...register('fullName')}
                            className={cn({ 'border-destructive': errors.fullName })}
                            placeholder="John Doe"
                        />
                        {errors.fullName && (
                            <p className="text-sm text-destructive">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="block text-sm font-semibold">
                            Password *
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register('password')}
                                className={cn({ 'border-destructive': errors.password })}
                                placeholder="Create a password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold">
                            Confirm Password *
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register('confirmPassword')}
                                className={cn({ 'border-destructive': errors.confirmPassword })}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="avatarUrl" className="block text-sm font-semibold">
                            Avatar URL (Optional)
                        </label>
                        <Input
                            id="avatarUrl"
                            type="url"
                            {...register('avatarUrl')}
                            className={cn({ 'border-destructive': errors.avatarUrl })}
                            placeholder="https://example.com/avatar.jpg"
                        />
                        {errors.avatarUrl && (
                            <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/onboarding/step2')}
                        disabled={isSubmitting}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? 'Saving...' : 'Continue'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Step3Profile;
