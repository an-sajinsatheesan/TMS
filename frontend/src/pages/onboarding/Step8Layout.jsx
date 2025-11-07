import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { LayoutList, LayoutGrid, Calendar, GanttChart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { completeOnboarding } from '../../store/slices/onboardingSlice';
import { refreshOnboardingStatus } from '../../store/slices/authSlice';
import { toast } from '../../hooks/useToast';

const Step8Layout = () => {
  const [selectedLayout, setSelectedLayout] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setCurrentStep, saveLayout } = useOnboarding();
  const reduxError = useSelector((state) => state.onboarding?.error);
  const { user } = useSelector((state) => state.auth);

  const layouts = [
    { id: 'list', name: 'List', icon: LayoutList, description: 'Simple list view' },
    { id: 'board', name: 'Board', icon: LayoutGrid, description: 'Kanban board' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, description: 'Calendar view' },
    { id: 'timeline', name: 'Timeline', icon: GanttChart, description: 'Gantt timeline' },
  ];

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      // Convert lowercase to uppercase for backend validation
      await saveLayout({ layout: selectedLayout.toUpperCase() });

      console.log('✅ Layout saved successfully!');

      setCurrentStep(8);
      navigate('/onboarding/step8');
    } catch (error) {
      console.error('Failed to save layout:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save layout. Please try again.';
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipToComplete = async () => {
    try {
      setIsSubmitting(true);
      setLocalError(null);

      // Save the layout first
      await saveLayout({ layout: selectedLayout.toUpperCase() });

      // Complete onboarding without invites
      const response = await dispatch(completeOnboarding({ inviteEmails: [] })).unwrap();
      await dispatch(refreshOnboardingStatus());

      toast.success('Onboarding completed successfully!');

      // Navigate to project board or dashboard
      const project = response?.project;
      const userId = user?.id;

      if (project?.id && userId) {
        navigate(`/project-board/${userId}/${project.id}/list`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      const errorMessage = error.response?.data?.message || error || 'Failed to complete onboarding. Please try again.';
      setLocalError(errorMessage);
      toast.error('Failed to complete onboarding', {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Choose your default layout</h2>
        <p className="text-gray-600">
          You can switch between layouts anytime.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {layouts.map((layout) => {
          const Icon = layout.icon;
          return (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`p-6 border-2 rounded-lg transition-all hover:border-primary/50 ${
                selectedLayout === layout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200'
              }`}
            >
              <Icon className="w-8 h-8 mb-3 mx-auto" />
              <div className="text-center">
                <div className="font-semibold mb-1">{layout.name}</div>
                <div className="text-sm text-gray-600">{layout.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {(localError || reduxError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError || reduxError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/onboarding/step6')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkipToComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Completing...' : 'Skip & Complete'}
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Continue to Invite Team'}
        </Button>
      </div>
    </div>
  );
};

export default Step8Layout;
