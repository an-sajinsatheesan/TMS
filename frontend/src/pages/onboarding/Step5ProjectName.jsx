import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { projectNameSchema } from '../../utils/validationSchemas';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Step5ProjectName = () => {
  const navigate = useNavigate();
  const { setCurrentStep, onboardingData } = useOnboarding();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(projectNameSchema),
    defaultValues: {
      projectName: ''
    }
  });

  const onSubmit = (data) => {
    // Store in context for later use
    onboardingData.projectSetup.projectName = data.projectName;
    setCurrentStep(6);
    navigate('/onboarding/step6');
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">Create Your First Project</h2>
        <p className="text-gray-600">
          Projects help you organize work into manageable units.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="projectName" className="block text-gray-700 text-sm font-semibold">
              Project Name *
            </label>
            <InputText
              id="projectName"
              {...register('projectName')}
              className={classNames('w-full', { 'p-invalid': errors.projectName })}
              placeholder="e.g., Website Redesign, Q1 Marketing Campaign"
              aria-describedby="projectName-error"
            />
            {errors.projectName && (
              <small id="projectName-error" className="p-error">
                {errors.projectName.message}
              </small>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/onboarding/step4')}
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
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step5ProjectName;
