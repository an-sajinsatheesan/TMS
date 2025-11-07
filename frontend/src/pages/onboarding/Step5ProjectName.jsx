import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveProjectName, clearError } from '../../store/slices/onboardingSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

const Step5ProjectName = () => {
  const [projectName, setProjectName] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.onboarding);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleContinue = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!projectName.trim()) {
      setLocalError('Please enter a project name');
      return;
    }

    try {
      await dispatch(saveProjectName(projectName)).unwrap();
      toast.success('Project name saved successfully');
      navigate('/onboarding/step5');
    } catch (err) {
      toast.error('Failed to save project name', {
        description: err || 'Please try again'
      });
      setLocalError(err || 'Failed to save. Please try again.');
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

      {(localError || reduxError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError || reduxError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleContinue} className="space-y-6 mb-8">
        <div className="flex flex-col gap-2">
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Website Redesign"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step3')}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!projectName.trim() || loading}
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step5ProjectName;
