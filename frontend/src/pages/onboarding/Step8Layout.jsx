import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';

const Step8Layout = () => {
  const [selectedLayout, setSelectedLayout] = useState('BOARD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentStep, saveLayout } = useOnboarding();

  const layouts = [
    { value: 'LIST', name: 'List', description: 'Simple task list view' },
    { value: 'BOARD', name: 'Board', description: 'Kanban-style board view' },
    { value: 'TIMELINE', name: 'Timeline', description: 'Gantt chart timeline view' },
    { value: 'CALENDAR', name: 'Calendar', description: 'Calendar view for scheduling' },
  ];

  const handleContinue = async () => {
    setError('');
    setLoading(true);

    try {
      await saveLayout({ layout: selectedLayout });
      setCurrentStep(9);
      navigate('/onboarding/step9');
    } catch (err) {
      setError(err.message || 'Failed to save layout');
    } finally {
      setLoading(false);
    }
  };

  const layoutIcons = {
    LIST: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    BOARD: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    TIMELINE: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    CALENDAR: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Choose Your Layout</h2>
        <p className="text-gray-600">
          Select how you want to view your project. You can change this anytime.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {layouts.map((layout) => (
          <div
            key={layout.value}
            onClick={() => setSelectedLayout(layout.value)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedLayout === layout.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-start">
              <div className={`mr-3 ${selectedLayout === layout.value ? 'text-blue-600' : 'text-gray-400'}`}>
                {layoutIcons[layout.value]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-800">{layout.name}</h3>
                  <input
                    type="radio"
                    checked={selectedLayout === layout.value}
                    onChange={() => setSelectedLayout(layout.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{layout.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/onboarding/step7')}
          disabled={loading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Step8Layout;
