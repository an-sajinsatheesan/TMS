import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { projectsService } from '../../services/api';

const SECTION_COLORS = [
  '#94a3b8', // slate
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

const CreateProjectModal = ({ visible, onHide, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Project Info
  const [projectName, setProjectName] = useState('');
  const [layout, setLayout] = useState('BOARD');

  // Step 2: Sections
  const [sections, setSections] = useState([
    { name: 'To Do', color: '#94a3b8' },
    { name: 'In Progress', color: '#3b82f6' },
    { name: 'Done', color: '#22c55e' },
  ]);

  // Step 3: Tasks (optional)
  const [tasks, setTasks] = useState([]);

  // Step 4: Invite Members (optional)
  const [inviteEmails, setInviteEmails] = useState(['']);

  const layouts = [
    { value: 'LIST', label: 'List', icon: 'pi-list' },
    { value: 'BOARD', label: 'Board', icon: 'pi-th-large' },
    { value: 'TIMELINE', label: 'Timeline', icon: 'pi-chart-line' },
    { value: 'CALENDAR', label: 'Calendar', icon: 'pi-calendar' },
  ];

  const handleAddSection = () => {
    setSections([...sections, { name: '', color: SECTION_COLORS[sections.length % SECTION_COLORS.length] }]);
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { title: '', sectionName: sections[0]?.name || '' }]);
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleAddEmail = () => {
    setInviteEmails([...inviteEmails, '']);
  };

  const handleRemoveEmail = (index) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index, value) => {
    const updated = [...inviteEmails];
    updated[index] = value;
    setInviteEmails(updated);
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const projectData = {
        name: projectName,
        layout,
        sections: sections.filter(s => s.name.trim()),
        tasks: tasks.filter(t => t.title.trim()),
        inviteEmails: inviteEmails.filter(e => e.trim()),
      };

      await projectsService.create(projectData);
      onSuccess(); // Just notify success, ProjectContext will handle refresh
      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName('');
    setLayout('BOARD');
    setSections([
      { name: 'To Do', color: '#94a3b8' },
      { name: 'In Progress', color: '#3b82f6' },
      { name: 'Done', color: '#22c55e' },
    ]);
    setTasks([]);
    setInviteEmails(['']);
    setActiveStep(0);
    onHide();
  };

  const isStep1Valid = projectName.trim().length > 0;
  const isStep2Valid = sections.some(s => s.name.trim());

  return (
    <Dialog
      visible={visible}
      onHide={handleClose}
      header="Create New Project"
      style={{ width: '50vw' }}
      breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      modal
    >
      <Stepper activeStep={activeStep} linear>
        {/* Step 1: Project Info */}
        <StepperPanel header="Project Info">
          <div className="flex flex-column gap-3 p-4">
            <div>
              <label htmlFor="project-name" className="block font-medium mb-2">
                Project Name *
              </label>
              <InputText
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Layout</label>
              <div className="grid grid-cols-4 gap-2">
                {layouts.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLayout(l.value)}
                    className={`p-3 border rounded flex flex-col items-center gap-2 transition-all ${
                      layout === l.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <i className={`pi ${l.icon} text-xl`}></i>
                    <span className="text-sm">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button label="Cancel" outlined onClick={handleClose} />
              <Button
                label="Next"
                onClick={handleNext}
                disabled={!isStep1Valid}
              />
            </div>
          </div>
        </StepperPanel>

        {/* Step 2: Sections */}
        <StepperPanel header="Sections">
          <div className="flex flex-column gap-3 p-4">
            <p className="text-gray-600 mb-2">Add sections to organize your tasks</p>

            {sections.map((section, index) => (
              <div key={index} className="flex gap-2 items-center">
                <InputText
                  value={section.name}
                  onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                  placeholder="Section name"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={section.color}
                  onChange={(e) => handleSectionChange(index, 'color', e.target.value)}
                  className="w-10 h-10 border rounded cursor-pointer"
                />
                {sections.length > 1 && (
                  <Button
                    icon="pi pi-times"
                    onClick={() => handleRemoveSection(index)}
                    className="p-button-text p-button-danger"
                    size="small"
                  />
                )}
              </div>
            ))}

            <Button
              label="Add Section"
              icon="pi pi-plus"
              onClick={handleAddSection}
              className="p-button-text"
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button label="Back" outlined onClick={handleBack} />
              <Button
                label="Next"
                onClick={handleNext}
                disabled={!isStep2Valid}
              />
            </div>
          </div>
        </StepperPanel>

        {/* Step 3: Tasks (Optional) */}
        <StepperPanel header="Tasks (Optional)">
          <div className="flex flex-column gap-3 p-4">
            <p className="text-gray-600 mb-2">Add initial tasks (you can skip this step)</p>

            {tasks.map((task, index) => (
              <div key={index} className="flex gap-2 items-center">
                <InputText
                  value={task.title}
                  onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                  placeholder="Task name"
                  className="flex-1"
                />
                <select
                  value={task.sectionName}
                  onChange={(e) => handleTaskChange(index, 'sectionName', e.target.value)}
                  className="p-2 border rounded"
                >
                  {sections.filter(s => s.name).map((section) => (
                    <option key={section.name} value={section.name}>
                      {section.name}
                    </option>
                  ))}
                </select>
                <Button
                  icon="pi pi-times"
                  onClick={() => handleRemoveTask(index)}
                  className="p-button-text p-button-danger"
                  size="small"
                />
              </div>
            ))}

            <Button
              label="Add Task"
              icon="pi pi-plus"
              onClick={handleAddTask}
              className="p-button-text"
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button label="Back" outlined onClick={handleBack} />
              <Button label="Next" onClick={handleNext} />
            </div>
          </div>
        </StepperPanel>

        {/* Step 4: Invite Members (Optional) */}
        <StepperPanel header="Invite Members (Optional)">
          <div className="flex flex-column gap-3 p-4">
            <p className="text-gray-600 mb-2">Invite team members to collaborate (you can skip this step)</p>

            {inviteEmails.map((email, index) => (
              <div key={index} className="flex gap-2 items-center">
                <InputText
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1"
                />
                {inviteEmails.length > 1 && (
                  <Button
                    icon="pi pi-times"
                    onClick={() => handleRemoveEmail(index)}
                    className="p-button-text p-button-danger"
                    size="small"
                  />
                )}
              </div>
            ))}

            <Button
              label="Add Another Email"
              icon="pi pi-plus"
              onClick={handleAddEmail}
              className="p-button-text"
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button label="Back" outlined onClick={handleBack} />
              <Button
                label="Create Project"
                onClick={handleSubmit}
                loading={loading}
                icon="pi pi-check"
              />
            </div>
          </div>
        </StepperPanel>
      </Stepper>
    </Dialog>
  );
};

CreateProjectModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default CreateProjectModal;
