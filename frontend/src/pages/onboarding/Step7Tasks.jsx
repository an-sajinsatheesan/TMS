import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';

const Step7Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentStep, onboardingData, saveProjectSetup } = useOnboarding();

  const sections = onboardingData.projectSetup?.sections || [];

  const sectionOptions = sections.map(section => ({
    label: section.name,
    value: section.name
  }));

  const addTask = () => {
    if (taskTitle.trim() && selectedSection) {
      setTasks([...tasks, { title: taskTitle, sectionName: selectedSection }]);
      setTaskTitle('');
      setSelectedSection('');
    }
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    setError('');
    setLoading(true);

    try {
      const projectData = {
        projectName: onboardingData.projectSetup.projectName,
        sections: sections,
        tasks: tasks,
      };

      await saveProjectSetup(projectData);
      setCurrentStep(8);
      navigate('/onboarding/step8');
    } catch (err) {
      setError(err.message || 'Failed to save project setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Add Some Tasks</h2>
        <p className="text-gray-600">
          Add a few tasks to get started. You can always add more later.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} className="w-full" />
        </div>
      )}

      <div className="space-y-6 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Add Task
          </label>
          <div className="space-y-3">
            <InputText
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && selectedSection && addTask()}
              className="w-full"
              placeholder="Task title"
            />
            <div className="flex gap-2">
              <Dropdown
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.value)}
                options={sectionOptions}
                optionLabel="label"
                placeholder="Select section"
                className="flex-1"
              />
              <button
                type="button"
                onClick={addTask}
                disabled={!taskTitle.trim() || !selectedSection}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {tasks.length > 0 && (
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-3">
              Tasks ({tasks.length})
            </label>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{task.title}</div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {task.sectionName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="ml-3 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/onboarding/step6')}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

export default Step7Tasks;
