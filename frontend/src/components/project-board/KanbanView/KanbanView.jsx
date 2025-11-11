import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useProjectData } from '@/hooks/useProjectData';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import TaskDetailsDialog from '../TaskDetailsDialog';
import ProjectActionBar from '../ProjectActionBar';
import { toast } from 'sonner';

const KanbanView = ({ projectId }) => {
  const {
    sections,
    tasks,
    loading,
    error,
    updateTask,
    createTask,
    deleteTask,
    createSection,
    moveTask,
  } = useProjectData(projectId);

  const [activeId, setActiveId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by section (only show top-level tasks, not subtasks in Kanban)
  const tasksBySection = useMemo(() => {
    const grouped = {};

    sections.forEach(section => {
      grouped[section.id] = tasks.filter(
        task => task.sectionId === section.id && !task.parentId
      );
    });

    return grouped;
  }, [sections, tasks]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    // Optional: Add visual feedback during drag
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const newSectionId = over.id;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // If section hasn't changed, don't update
    if (task.sectionId === newSectionId) return;

    try {
      await moveTask(taskId, newSectionId, 0);
      toast.success('Task moved successfully');
    } catch (err) {
      console.error('Failed to move task:', err);
      toast.error('Failed to move task');
    }
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTaskId(null);
  };

  const handleAddTask = async (type, sectionId) => {
    // For Kanban, use first section if no section specified
    const targetSectionId = sectionId || sections[0]?.id;

    if (!targetSectionId) {
      toast.error('Please create a section first');
      return;
    }

    try {
      const taskData = {
        title: type === 'milestone' ? 'New Milestone' : type === 'approval' ? 'New Approval' : 'New Task',
        type: type.toUpperCase(),
      };

      await createTask(targetSectionId, taskData);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
    } catch (err) {
      console.error(`Failed to create ${type}:`, err);
      toast.error(`Failed to add ${type}`);
    }
  };

  const handleAddSection = async () => {
    try {
      await createSection({ name: 'New Section' });
      toast.success('Section created successfully');
    } catch (err) {
      console.error('Failed to create section:', err);
      toast.error('Failed to create section');
    }
  };

  const handleAddTaskToColumn = async (sectionId) => {
    try {
      await createTask(sectionId, {
        title: 'New Task',
      });
      toast.success('Task added successfully');
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTaskName = async (taskId, newName) => {
    try {
      await updateTask(taskId, { title: newName });
    } catch (err) {
      console.error('Failed to update task name:', err);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ProjectActionBar
          onAddTask={() => {}}
          onAddSection={() => {}}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const activeTask = tasks.find(t => t.id === activeId);

  return (
    <div className="flex flex-col h-full">
      {/* Project Action Bar */}
      <ProjectActionBar
        onAddTask={handleAddTask}
        onAddSection={handleAddSection}
      />

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-4 h-[calc(100vh-170px)]">
          <div className="flex gap-4 h-full min-h-0">
            {sections.map((section) => (
              <KanbanColumn
                key={section.id}
                section={section}
                tasks={tasksBySection[section.id] || []}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTaskToColumn}
                onUpdateTaskName={handleUpdateTaskName}
              />
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard task={activeTask} onClick={() => {}} onUpdateTaskName={handleUpdateTaskName} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onClose={handleCloseTaskDetails}
      />
    </div>
  );
};

export default KanbanView;
