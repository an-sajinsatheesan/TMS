import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
          <Input
            id="workspaceName"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="e.g. Cross-functional project plan"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!workspaceName.trim()}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step2CreateWorkspace;
