import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { updateStep } from '../../store/slices/onboardingSlice';
import { Button } from '@/components/ui/button';
import { toast } from '../../hooks/useToast.jsx';

const Step1Welcome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.onboarding);

  const handleGetStarted = async (e) => {
    e.preventDefault();

    try {
      await dispatch(updateStep(2)).unwrap();
      navigate('/onboarding/step2');
    } catch (err) {
      toast.error('Failed to start onboarding', {
        description: err || 'Please try again'
      });
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error('Error', {
        description: error
      });
    }
  }, [error]);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to TMS!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Let's get you set up with your workspace and first project.
        This will only take a few minutes.
      </p>

      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-4 border rounded-lg">
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-semibold mb-1">Create Workspace</div>
            <div className="text-gray-600">Set up your team workspace</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold mb-1">Create Project</div>
            <div className="text-gray-600">Start your first project</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold mb-1">Invite Team</div>
            <div className="text-gray-600">Add your team members</div>
          </div>
        </div>
      </div>

      <Button onClick={handleGetStarted} size="lg" className="px-8" disabled={loading}>
        {loading ? 'Loading...' : 'Get Started'}
      </Button>
    </div>
  );
};

export default Step1Welcome;
