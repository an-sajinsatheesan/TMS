import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveWorkspace, clearError } from '../../store/slices/onboardingSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

const Step2CreateWorkspace = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.onboarding);

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!workspaceName.trim()) {
      setLocalError('Please enter a workspace name');
      return;
    }

    setLocalError('');

    try {
      await dispatch(saveWorkspace({ name: workspaceName })).unwrap();
      toast.success('Workspace saved successfully');
      navigate('/onboarding/step3');
    } catch (err) {
      toast.error('Failed to save workspace', {
        description: err || 'Please try again'
      });
    }
  };

  // Clear Redux error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const displayError = localError || error;

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Create your workspace</h2>
        <p className="text-gray-600">
          A workspace is where your team collaborates on projects.
        </p>
      </div>

      {displayError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleContinue} className="space-y-6 mb-8">
        <div className="flex flex-col gap-2">
          <label htmlFor="workspaceName" className="block text-sm font-semibold">
            Workspace Name *
          </label>
          <Input
            id="workspaceName"
            value={workspaceName}
            onChange={(e) => {
              setWorkspaceName(e.target.value);
              setLocalError('');
            }}
            placeholder="e.g. My Company"
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding')}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!workspaceName.trim() || loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step2CreateWorkspace;
