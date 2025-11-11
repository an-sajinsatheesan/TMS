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

// Default status columns for Kanban board
const DEFAULT_STATUSES = [
  { label: 'Backlog', value: null, color: '#94a3b8' },
  { label: 'On Track', value: 'On Track', color: '#10b981' },
  { label: 'At Risk', value: 'At Risk', color: '#f59e0b' },
  { label: 'Off Track', value: 'Off Track', color: '#ef4444' },
  { label: 'On Hold', value: 'On Hold', color: '#6b7280' },
  { label: 'Completed', value: 'Completed', color: '#8b5cf6' },
];

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

  // Flatten nested tasks for Kanban view (show all tasks including subtasks)
  const flattenTasks = (taskList) => {
    const result = [];
    const flatten = (tasks) => {
      tasks.forEach(task => {
        result.push(task);
        if (task.subtasks && task.subtasks.length > 0) {
          flatten(task.subtasks);
        }
      });
    };
    flatten(taskList);
    return result;
  };

  const allTasks = useMemo(() => flattenTasks(tasks), [tasks]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {};

    DEFAULT_STATUSES.forEach(status => {
      grouped[status.value || 'backlog'] = allTasks.filter(
        task => task.status === status.value
      );
    });

    return grouped;
  }, [allTasks]);

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
    const newStatus = over.id === 'backlog' ? null : over.id;

    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    // If status hasn't changed, don't update
    if (task.status === newStatus) return;

    try {
      await updateTask(taskId, { status: newStatus });
      toast.success('Task status updated');
    } catch (err) {
      console.error('Failed to update task status:', err);
      toast.error('Failed to update task status');
    }
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTaskId(null);
  };

  const handleAddTask = async (type, sectionId) => {
    // For Kanban, we need at least one section
    const firstSection = sections[0];

    if (!firstSection) {
      toast.error('Please create a section first');
      return;
    }

    try {
      const taskData = {
        title: type === 'milestone' ? 'New Milestone' : type === 'approval' ? 'New Approval' : 'New Task',
        type: type.toUpperCase(),
      };

      await createTask(firstSection.id, taskData);
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

  const handleAddTaskToColumn = async (statusValue) => {
    const firstSection = sections[0];

    if (!firstSection) {
      toast.error('Please create a section first');
      return;
    }

    try {
      await createTask(firstSection.id, {
        title: 'New Task',
        status: statusValue,
      });
      toast.success('Task added successfully');
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error('Failed to create task');
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

  const activeTask = allTasks.find(t => t.id === activeId);

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
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          <div className="flex gap-4 h-full">
            {DEFAULT_STATUSES.map((status) => (
              <KanbanColumn
                key={status.value || 'backlog'}
                status={status}
                tasks={tasksByStatus[status.value || 'backlog'] || []}
                color={status.color}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTaskToColumn}
              />
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard task={activeTask} onClick={() => {}} />
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
