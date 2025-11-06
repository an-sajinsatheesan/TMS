import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { LayoutList, LayoutGrid, Calendar, GanttChart } from 'lucide-react';

const Step8Layout = () => {
  const [selectedLayout, setSelectedLayout] = useState('list');
  const navigate = useNavigate();
  const { setCurrentStep, updateOnboardingData } = useOnboarding();

  const layouts = [
    { id: 'list', name: 'List', icon: LayoutList, description: 'Simple list view' },
    { id: 'board', name: 'Board', icon: LayoutGrid, description: 'Kanban board' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, description: 'Calendar view' },
    { id: 'timeline', name: 'Timeline', icon: GanttChart, description: 'Gantt timeline' },
  ];

  const handleContinue = () => {
    updateOnboardingData('projectSetup', { defaultLayout: selectedLayout });
    setCurrentStep(8);
    navigate('/onboarding/step8');
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Choose your default layout</h2>
        <p className="text-gray-600">
          You can switch between layouts anytime.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {layouts.map((layout) => {
          const Icon = layout.icon;
          return (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                selectedLayout === layout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
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
        >
          Back
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

export default Step8Layout;
