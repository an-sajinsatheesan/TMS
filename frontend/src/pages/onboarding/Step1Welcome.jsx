import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';

const Step1Welcome = () => {
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboarding();

  const handleContinue = () => {
    setCurrentStep(2);
    navigate('/onboarding/step2');
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to StackFlow</h2>
        <p className="text-gray-600">
          Let's get you set up with your workspace. This will only take a few minutes.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">What we'll do:</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Set up your profile</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Tell us about your role</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Create your first project</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Invite your team</span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleContinue}
        className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Let's Get Started
      </button>
    </div>
  );
};

export default Step1Welcome;
