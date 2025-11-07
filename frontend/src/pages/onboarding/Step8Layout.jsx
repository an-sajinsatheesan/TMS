import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveLayout, clearError } from '../../store/slices/onboardingSlice';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LayoutList, LayoutGrid, Calendar, GanttChart, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

const Step8Layout = () => {
  const [selectedLayout, setSelectedLayout] = useState('list');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.onboarding);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const layouts = [
    { id: 'list', name: 'List', icon: LayoutList, description: 'Simple list view' },
    { id: 'board', name: 'Board', icon: LayoutGrid, description: 'Kanban board' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, description: 'Calendar view' },
    { id: 'timeline', name: 'Timeline', icon: GanttChart, description: 'Gantt timeline' },
  ];

  const handleContinue = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      await dispatch(saveLayout(selectedLayout)).unwrap();
      toast.success('Layout saved successfully');
      navigate('/onboarding/step8');
    } catch (err) {
      toast.error('Failed to save layout', {
        description: err || 'Please try again'
      });
      setLocalError(err || 'Failed to save. Please try again.');
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

      {(localError || reduxError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError || reduxError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleContinue}>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {layouts.map((layout) => {
            const Icon = layout.icon;
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => setSelectedLayout(layout.id)}
                disabled={loading}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  selectedLayout === layout.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className={`h-8 w-8 mb-3 ${
                  selectedLayout === layout.id ? 'text-primary' : 'text-gray-600'
                }`} />
                <div className="font-semibold mb-1">{layout.name}</div>
                <div className="text-sm text-gray-600">{layout.description}</div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step6')}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step8Layout;
