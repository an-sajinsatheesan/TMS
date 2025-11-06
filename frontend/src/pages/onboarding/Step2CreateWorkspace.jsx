import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Step2CreateWorkspace = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { setCurrentStep, saveWorkspace } = useOnboarding();

  const handleContinue = async () => {
    if (!workspaceName.trim()) {
      setError('Please enter a workspace name');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await saveWorkspace({ name: workspaceName });
      setCurrentStep(3);
      navigate('/onboarding/step3');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save workspace. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Create your workspace</h2>
        <p className="text-gray-600">
          A workspace is where your team collaborates on projects.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6 mb-8">
        <div className="flex flex-col gap-2">
          <label htmlFor="workspaceName" className="block text-sm font-semibold">
            Workspace Name *
          </label>
          <Input
            id="workspaceName"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="e.g. My Company"
            disabled={saving}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/onboarding')}
          disabled={saving}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!workspaceName.trim() || saving}
          className="flex-1"
        >
          {saving ? 'Creating...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Step2CreateWorkspace;
