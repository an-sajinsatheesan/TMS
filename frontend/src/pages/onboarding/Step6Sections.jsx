import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

const Step6Sections = () => {
  const [sections, setSections] = useState(['To Do', 'In Progress', 'Done']);
  const [newSection, setNewSection] = useState('');
  const navigate = useNavigate();
  const { setCurrentStep, updateOnboardingData } = useOnboarding();

  const handleAddSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      setSections([...sections, newSection.trim()]);
      setNewSection('');
    }
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    updateOnboardingData('projectSetup', { sections });
    setCurrentStep(6);
    navigate('/onboarding/step6');
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Add sections to your project</h2>
        <p className="text-gray-600">
          Sections help you organize tasks into different stages.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={section} readOnly className="flex-1" />
              {sections.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSection(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="Add a new section"
            onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
          />
          <Button type="button" onClick={handleAddSection} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
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
          disabled={sections.length === 0}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Step6Sections;
