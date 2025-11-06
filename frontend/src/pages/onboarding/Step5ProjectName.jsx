import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Step5ProjectName = () => {
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();
  const { setCurrentStep, updateOnboardingData } = useOnboarding();

  const handleContinue = () => {
    if (projectName.trim()) {
      updateOnboardingData('projectSetup', { projectName });
      setCurrentStep(6);
      navigate('/onboarding/step6');
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Name your first project</h2>
        <p className="text-gray-600">
          What would you like to call it?
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-col gap-2">
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Website Redesign"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/onboarding/step4')}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!projectName.trim()}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step5ProjectName;
