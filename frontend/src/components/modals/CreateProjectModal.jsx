import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { projectsService, templatesService } from '../../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, ChevronRight, ChevronLeft, Check, FileText, Sparkles } from 'lucide-react';
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

  // Template state
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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

  const totalSteps = selectedTemplate ? 3 : 5;

  // Fetch templates on mount
  useEffect(() => {
    if (visible) {
      fetchTemplates();
    }
  }, [visible]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await templatesService.getAll();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleNext = () => {
    // Step 1: Template selection - no validation needed
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    // Step 2: Project name validation
    if (currentStep === 2 && !projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    // Step 2: If template selected, skip to layout (step 5)
    if (currentStep === 2 && selectedTemplate) {
      setCurrentStep(5);
      return;
    }

    // Step 3: Sections validation (only for blank projects)
    if (currentStep === 3 && sections.length === 0) {
      toast.error('Please add at least one section');
      return;
    }

    // Move to next step
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    // Step 5: If template selected, go back to step 2 (skip 3-4)
    if (currentStep === 5 && selectedTemplate) {
      setCurrentStep(2);
      return;
    }

    // Normal back navigation
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
      let projectData;

      if (selectedTemplate) {
        // Create project with template
        projectData = {
          name: projectName,
          templateId: selectedTemplate.id,
          layout,
          color: projectColor
        };
      } else {
        // Create blank project with custom sections and tasks
        projectData = {
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
      }

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
    setSelectedTemplate(null);
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
        // Template Selection Step
        return (
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-3">
                Choose a starting point for your project
              </label>
            </div>

            {loadingTemplates ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-gray-500">Loading templates...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {/* Blank Project Option */}
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedTemplate === null
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-1">Blank Project</div>
                      <div className="text-sm text-gray-500">
                        Start from scratch and customize everything
                      </div>
                    </div>
                    {selectedTemplate === null && (
                      <Check className="w-5 h-5 text-primary mt-1" />
                    )}
                  </div>
                </button>

                {/* Template Options */}
                {templates.length > 0 && (
                  <>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Templates
                      </h4>
                    </div>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template)}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: template.color ? `${template.color}20` : '#f3f4f6'
                            }}
                          >
                            <FileText
                              className="w-6 h-6"
                              style={{ color: template.color || '#4b5563' }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{template.name}</span>
                              {template.category && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {template.category}
                                </span>
                              )}
                            </div>
                            {template.description && (
                              <div className="text-sm text-gray-500 mb-2">
                                {template.description}
                              </div>
                            )}
                            {template.sections && template.sections.length > 0 && (
                              <div className="text-xs text-gray-400">
                                {template.sections.length} sections • {template.tasks?.length || 0} tasks
                              </div>
                            )}
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <Check className="w-5 h-5 text-primary mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        // Project Name & Color Step
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

      case 3:
        // Sections Step (skip if template selected)
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

      case 4:
        // Tasks Step (skip if template selected)
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

      case 5:
        // Layout & Summary Step
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
                {selectedTemplate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">{selectedTemplate.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Name:</span>
                  <span className="font-medium">{projectName || 'Not set'}</span>
                </div>
                {!selectedTemplate && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sections:</span>
                      <span className="font-medium">{sections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks:</span>
                      <span className="font-medium">{tasks.filter(t => t.title.trim()).length}</span>
                    </div>
                  </>
                )}
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
  const StepIndicator = () => {
    const steps = selectedTemplate ? [1, 2, 5] : [1, 2, 3, 4, 5];

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? 'bg-primary text-white'
                  : step < currentStep || (selectedTemplate && currentStep === 5 && step === 2)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step < currentStep || (selectedTemplate && currentStep === 5 && step === 2) ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  step < currentStep || (selectedTemplate && currentStep === 5 && step === 2)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const stepTitles = [
    'Select Template',
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
              onClick={currentStep === 5 ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? (
                'Creating...'
              ) : currentStep === 5 ? (
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
