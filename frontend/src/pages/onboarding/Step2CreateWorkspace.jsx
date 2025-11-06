import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Step2CreateWorkspace = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboarding();

  const handleContinue = () => {
    if (workspaceName.trim()) {
      setCurrentStep(3);
      navigate('/onboarding/step3');
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">Let's set up your first project</h2>
        <p className="text-gray-600 text-base">
          What's something you and your team are currently working on?
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-col gap-2">
          <InputText
            id="workspaceName"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full"
            placeholder="e.g. Cross-functional project plan"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!workspaceName.trim()}
          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step2CreateWorkspace;
