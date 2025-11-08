import { useState } from 'react';
import PropTypes from 'prop-types';
import { projectsService } from '../../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

// Color palette for project selection
const PROJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1',
  '#a855f7'
];

// Default section colors
const SECTION_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

const CreateProjectModal = ({ visible, onHide, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Project data state
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState('#3b82f6');
  const [sections, setSections] = useState([
    { name: 'To Do', color: SECTION_COLORS[0] },
    { name: 'In Progress', color: SECTION_COLORS[1] },
    { name: 'Done', color: SECTION_COLORS[2] }
  ]);
  const [tasks, setTasks] = useState([]);
  const [layout, setLayout] = useState('BOARD');

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep === 1 && !projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    if (currentStep === 2 && sections.length === 0) {
      toast.error('Please add at least one section');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        name: projectName,
        color: projectColor,
        layout,
        sections: sections.map((s, index) => ({
          name: s.name,
          color: s.color,
          position: index
        })),
        tasks: tasks.filter(t => t.title.trim()).map((t, index) => ({
          title: t.title,
          sectionName: t.sectionName,
          orderIndex: index
        }))
      };

      await projectsService.create(projectData);
      toast.success('Project created successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName('');
    setProjectColor('#3b82f6');
    setSections([
      { name: 'To Do', color: SECTION_COLORS[0] },
      { name: 'In Progress', color: SECTION_COLORS[1] },
      { name: 'Done', color: SECTION_COLORS[2] }
    ]);
    setTasks([]);
    setLayout('BOARD');
    setCurrentStep(1);
    onHide();
  };

  // Section handlers
  const addSection = () => {
    const colorIndex = sections.length % SECTION_COLORS.length;
    setSections([...sections, { name: '', color: SECTION_COLORS[colorIndex] }]);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const removeSection = (index) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    } else {
      toast.error('You must have at least one section');
    }
  };

  // Task handlers
  const updateTask = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 py-4">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium mb-2">
                Project Name *
              </label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Project Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setProjectColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      projectColor === color
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {projectColor === color && (
                      <Check className="w-5 h-5 text-white mx-auto drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Sections (Columns/Groups)
              </label>
              <Button type="button" size="sm" onClick={addSection} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Section
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {sections.map((section, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={section.color}
                        onChange={(e) => updateSection(index, 'color', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                        title="Choose section color"
                      />
                    </div>
                    <Input
                      value={section.name}
                      onChange={(e) => updateSection(index, 'name', e.target.value)}
                      placeholder={`Section ${index + 1} name`}
                    />
                  </div>
                  {sections.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSection(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Tasks (Optional)
              </label>
            </div>

            {sections.filter(s => s.name.trim()).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Please add sections first before adding tasks.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {sections.filter(s => s.name.trim()).map((section) => {
                  const sectionTasks = tasks.filter(t => t.sectionName === section.name);

                  return (
                    <div key={section.name} className="border rounded-lg p-4 space-y-3">
                      {/* Section Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: section.color }}
                          />
                          <span className="font-medium text-sm">{section.name}</span>
                          <span className="text-xs text-gray-500">
                            ({sectionTasks.length} {sectionTasks.length === 1 ? 'task' : 'tasks'})
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setTasks([...tasks, { title: '', sectionName: section.name }]);
                          }}
                          variant="ghost"
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Task
                        </Button>
                      </div>

                      {/* Tasks List */}
                      {sectionTasks.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No tasks yet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tasks.map((task, index) => {
                            if (task.sectionName !== section.name) return null;

                            return (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={task.title}
                                  onChange={(e) => updateTask(index, 'title', e.target.value)}
                                  placeholder="Task name"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTask(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium mb-3">
                Default View Layout
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'LIST', label: 'List', desc: 'Spreadsheet-style view' },
                  { value: 'BOARD', label: 'Board', desc: 'Kanban-style columns' },
                  { value: 'TIMELINE', label: 'Timeline', desc: 'Gantt chart view' },
                  { value: 'CALENDAR', label: 'Calendar', desc: 'Calendar view' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLayout(option.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      layout === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Project Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Name:</span>
                  <span className="font-medium">{projectName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sections:</span>
                  <span className="font-medium">{sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks:</span>
                  <span className="font-medium">{tasks.filter(t => t.title.trim()).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Layout:</span>
                  <span className="font-medium">{layout}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Stepper indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? 'bg-primary text-white'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-1 mx-2 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const stepTitles = [
    'Project Name & Color',
    'Create Sections',
    'Add Tasks',
    'Choose Layout'
  ];

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project - {stepTitles[currentStep - 1]}</DialogTitle>
        </DialogHeader>

        <StepIndicator />

        <form onSubmit={(e) => { e.preventDefault(); }}>
          {renderStepContent()}

          <div className="flex justify-between gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? handleClose : handleBack}
              disabled={loading}
            >
              {currentStep === 1 ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? (
                'Creating...'
              ) : currentStep === totalSteps ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Create Project
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

CreateProjectModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default CreateProjectModal;
