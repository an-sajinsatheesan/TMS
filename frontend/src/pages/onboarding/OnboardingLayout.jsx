import { Outlet } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';

const OnboardingLayout = () => {
  const { currentStep } = useOnboarding();

  const steps = [
    { number: 1, label: 'Welcome' },
    { number: 2, label: 'Workspace' },
    { number: 3, label: 'Company' },
    { number: 4, label: 'Project' },
    { number: 5, label: 'Sections' },
    { number: 6, label: 'Tasks' },
    { number: 7, label: 'Layout' },
    { number: 8, label: 'Invite' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number
                      ? 'bg-primary text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-1 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
