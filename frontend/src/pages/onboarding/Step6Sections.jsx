import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Step6Sections = () => {
  const [sections, setSections] = useState([
    { name: 'To Do', position: 0 },
    { name: 'In Progress', position: 1 },
    { name: 'Done', position: 2 },
  ]);
  const [newSection, setNewSection] = useState('');
  const navigate = useNavigate();
  const { setCurrentStep, onboardingData } = useOnboarding();

  const addSection = () => {
    if (newSection.trim()) {
      setSections([...sections, { name: newSection, position: sections.length }]);
      setNewSection('');
    }
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onboardingData.projectSetup.sections = sections;
    setCurrentStep(7);
    navigate('/onboarding/step7');
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Set Up Project Sections</h2>
        <p className="text-gray-600">
          Sections help you organize tasks. You can always change these later.
        </p>
      </div>

      <div className="space-y-6 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Current Sections
          </label>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="font-medium text-gray-800">{section.name}</span>
                </div>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    <i className="pi pi-times mr-1"></i>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="newSection" className="block text-gray-700 text-sm font-semibold mb-2">
            Add New Section
          </label>
          <div className="flex gap-2">
            <InputText
              id="newSection"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSection()}
              className="flex-1"
              placeholder="Section name"
            />
            <button
              type="button"
              onClick={addSection}
              disabled={!newSection.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <i className="pi pi-plus mr-1"></i>
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/onboarding/step5')}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step6Sections;
