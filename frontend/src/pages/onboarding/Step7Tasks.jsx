import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

const Step7Tasks = () => {
  const [tasks, setTasks] = useState(['']);
  const navigate = useNavigate();
  const { setCurrentStep, updateOnboardingData } = useOnboarding();

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

  const handleContinue = () => {
    const validTasks = tasks.filter(task => task.trim());
    updateOnboardingData('projectSetup', { tasks: validTasks });
    setCurrentStep(7);
    navigate('/onboarding/step7');
  };

  const handleSkip = () => {
    updateOnboardingData('projectSetup', { tasks: [] });
    setCurrentStep(7);
    navigate('/onboarding/step7');
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Add some tasks</h2>
        <p className="text-gray-600">
          Add a few tasks to get started. You can always add more later.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
                className="flex-1"
              />
              {tasks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTask(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button type="button" onClick={handleAddTask} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/onboarding/step5')}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
        >
          Skip
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step7Tasks;
