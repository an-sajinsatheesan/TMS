import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveTasks, clearError } from '../../store/slices/onboardingSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

const Step7Tasks = () => {
  const [tasks, setTasks] = useState(['']);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.onboarding);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleAddTask = () => {
    setTasks([...tasks, '']);
  };

  const handleRemoveTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setLocalError('');

    const validTasks = tasks.filter(task => task.trim());

    try {
      await dispatch(saveTasks(validTasks)).unwrap();
      toast.success('Tasks saved successfully');
      navigate('/onboarding/step7');
    } catch (err) {
      toast.error('Failed to save tasks', {
        description: err || 'Please try again'
      });
      setLocalError(err || 'Failed to save. Please try again.');
    }
  };

  const handleSkip = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      await dispatch(saveTasks([])).unwrap();
      toast.success('Step skipped successfully');
      navigate('/onboarding/step7');
    } catch (err) {
      toast.error('Failed to skip step', {
        description: err || 'Please try again'
      });
      setLocalError(err || 'Failed to skip. Please try again.');
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Add some tasks</h2>
        <p className="text-gray-600">
          Add a few tasks to get started. You can always add more later.
        </p>
      </div>

      {(localError || reduxError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError || reduxError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleContinue} className="space-y-6 mb-8">
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
                className="flex-1"
                disabled={loading}
              />
              {tasks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTask(index)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={handleAddTask}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step5')}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
          >
            {loading ? 'Skipping...' : 'Skip'}
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

export default Step7Tasks;
