import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import GroupHeader from './GroupHeader';
import TaskRow from './TaskRow';
import AddTaskRow from './AddTaskRow';
import ColumnHeader from './ColumnHeader';
import AddColumnPopover from './AddColumnPopover';
import TaskDetailsDialog from '../TaskDetailsDialog';
import { cn } from '@/lib/utils';
import { useProjectData } from '@/hooks/useProjectData';
import { fetchColumns, updateColumn, clearColumns } from '@/store/slices/columnsSlice';
import { useMembers } from '@/contexts/MembersContext';
import { ListViewProvider } from '@/contexts/ListViewContext';
import { sectionsService } from '@/services/api/sections.service';
import { toast } from 'sonner';

// Fixed column widths (sticky columns)
const FIXED_COLUMNS = {
  drag: 40, // px
  taskName: 320, // px
};

// Helper to get dynamic column width class
const getColumnWidthClass = (width) => {
  if (width <= 64) return 'w-16';
  if (width <= 100) return 'w-24';
  if (width <= 150) return 'w-32';
  if (width <= 200) return 'w-48';
  if (width <= 300) return 'w-64';
  return 'w-80';
};

const ListView = ({ projectId }) => {
  const dispatch = useDispatch();

  const {
    sections,
    tasks,
    loading: tasksLoading,
    error: tasksError,
    updateTask,
    createTask,
    deleteTask,
    moveTask,
    createSubtask,
    duplicateTask,
  } = useProjectData(projectId);

  const { columns: reduxColumns } = useSelector((state) => state.columns);
  const { users: projectMembers } = useMembers();

  const [activeId, setActiveId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch columns
  useEffect(() => {
    if (projectId) {
      dispatch(fetchColumns(projectId));
    }
    return () => dispatch(clearColumns());
  }, [projectId, dispatch]);

  // Get visible non-system columns
  const visibleColumns = useMemo(() => {
    return reduxColumns.filter((col) => col.visible !== false && !col.isSystem);
  }, [reduxColumns]);

  // Group tasks by section
  const tasksBySection = useMemo(() => {
    const grouped = {};
    sections.forEach((section) => {
      grouped[section.id] = tasks.filter((task) => task.sectionId === section.id);
    });
    return grouped;
  }, [tasks, sections]);

  // All draggable IDs
  const allDraggableIds = useMemo(() => {
    const sectionIds = sections.map((s) => `section-${s.id}`);
    const taskIds = tasks.filter((t) => !t.parentId).map((t) => t.id);
    return [...sectionIds, ...taskIds];
  }, [sections, tasks]);

  // Drag handlers
  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Section drag
    if (active.id.toString().startsWith('section-')) {
      const activeSectionId = active.id.toString().replace('section-', '');
      const overSectionId = over.id.toString().replace('section-', '');
      const oldIndex = sections.findIndex((s) => s.id === activeSectionId);
      const newIndex = sections.findIndex((s) => s.id === overSectionId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        try {
          const reorderedSections = [...sections];
          const [removed] = reorderedSections.splice(oldIndex, 1);
          reorderedSections.splice(newIndex, 0, removed);
          const sectionIds = reorderedSections.map((s) => s.id);
          await sectionsService.reorder(projectId, sectionIds);
          toast.success('Section reordered');
        } catch (err) {
          toast.error('Failed to reorder section');
        }
      }
    } else {
      // Task drag
      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      let destinationSectionId = activeTask.sectionId;
      let destinationIndex = 0;

      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        destinationSectionId = overTask.sectionId;
        const sectionTasks = tasksBySection[destinationSectionId]?.filter((t) => !t.parentId) || [];
        destinationIndex = sectionTasks.findIndex((t) => t.id === over.id);
      }

      const isSectionChanged = destinationSectionId !== activeTask.sectionId;
      const currentSectionTasks = tasksBySection[activeTask.sectionId]?.filter((t) => !t.parentId) || [];
      const currentIndex = currentSectionTasks.findIndex((t) => t.id === active.id);
      const isPositionChanged = currentIndex !== destinationIndex;

      if (isSectionChanged || isPositionChanged) {
        try {
          await moveTask(active.id, destinationSectionId, destinationIndex);
          toast.success('Task moved');
        } catch (err) {
          toast.error('Failed to move task');
        }
      }
    }
  };

  // Event handlers
  const handleToggleCollapse = (sectionId) => {
    setCollapsedGroups((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleToggleComplete = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      await updateTask(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
      });
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleAssigneeChange = async (taskId, userId) => {
    try {
      await updateTask(taskId, { assigneeId: userId });
    } catch (err) {
      toast.error('Failed to update assignee');
    }
  };

  const handleDateChange = async (taskId, date) => {
    try {
      await updateTask(taskId, { dueDate: date });
    } catch (err) {
      toast.error('Failed to update date');
    }
  };

  const handleSelectChange = async (taskId, columnId, value) => {
    try {
      const column = reduxColumns.find((col) => col.id === columnId);
      if (!column) return;

      const fieldMapping = { Priority: 'priority', Status: 'status' };
      const updatePayload = fieldMapping[column.name]
        ? { [fieldMapping[column.name]]: value }
        : { customFields: { [columnId]: value } };

      await updateTask(taskId, updatePayload);
    } catch (err) {
      toast.error('Failed to update field');
    }
  };

  const handleTaskNameSave = async (taskId, newName) => {
    try {
      await updateTask(taskId, { title: newName });
    } catch (err) {
      toast.error('Failed to update task name');
      throw err;
    }
  };

  const handleDuplicateTask = async (taskId) => {
    try {
      await duplicateTask(taskId);
      toast.success('Task duplicated');
    } catch (err) {
      toast.error('Failed to duplicate task');
    }
  };

  const handleCreateSubtask = async (taskId) => {
    try {
      await createSubtask(taskId, { title: 'New Subtask' });
      toast.success('Subtask created');
    } catch (err) {
      toast.error('Failed to create subtask');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleOpenTaskDetails = (taskId) => setSelectedTaskId(taskId);
  const handleCloseTaskDetails = () => setSelectedTaskId(null);

  // Toolbar handlers
  const handleFilterChange = (filters) => setActiveFilters(filters);
  const handleSortChange = (sortData) => {
    setSortConfig(sortData ? { column: sortData.field, direction: sortData.direction } : { column: null, direction: null });
  };
  const handleColumnVisibilityChange = async (columnId, visible) => {
    const column = reduxColumns.find((col) => col.id === columnId);
    if (!column || column.isSystem) return;
    try {
      await dispatch(updateColumn({ projectId, columnId, updates: { visible } })).unwrap();
    } catch (err) {
      toast.error('Failed to update column');
    }
  };

  const handleSort = (columnId, direction) => {
    setSortConfig({ column: columnId, direction });
  };

  const handleHideColumn = async (columnId) => {
    await handleColumnVisibilityChange(columnId, false);
  };

  // Render task with subtasks
  const renderTaskWithSubtasks = (task, level = 0) => {
    const subtasks = tasks.filter((t) => t.parentId === task.id);
    return (
      <div key={task.id}>
        <TaskRow
          task={task}
          columns={visibleColumns}
          onToggleComplete={handleToggleComplete}
          onAssigneeChange={handleAssigneeChange}
          onDateChange={handleDateChange}
          onSelectChange={handleSelectChange}
          onTaskNameSave={handleTaskNameSave}
          onDuplicate={handleDuplicateTask}
          onOpenDetails={handleOpenTaskDetails}
          onCreateSubtask={handleCreateSubtask}
          onDelete={handleDeleteTask}
          isSubtask={level > 0}
        />
        {task.isExpanded && subtasks.map((subtask) => renderTaskWithSubtasks(subtask, level + 1))}
      </div>
    );
  };

  // Context value for toolbar
  const listViewContextValue = {
    columns: reduxColumns,
    activeFilters,
    activeSort: sortConfig.column ? { field: sortConfig.column, direction: sortConfig.direction } : null,
    projectMembers,
    onFilterChange: handleFilterChange,
    onSortChange: handleSortChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
  };

  if (tasksLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <ListViewProvider value={listViewContextValue}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-full">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-30 bg-gray-50 border-b-2 border-gray-300 shadow-sm">
            <div className="flex">
              {/* Drag column - Sticky */}
              <div className="sticky left-0 z-40 bg-gray-50 border-r border-gray-300" style={{ width: FIXED_COLUMNS.drag }} />

              {/* Task Name column - Sticky */}
              <div className="sticky z-40 bg-gray-50" style={{ left: FIXED_COLUMNS.drag, width: FIXED_COLUMNS.taskName }}>
                <ColumnHeader
                  column={{ id: 'taskName', name: 'Task Name', type: 'text' }}
                  onSort={handleSort}
                  onHide={() => {}}
                  sortConfig={sortConfig}
                />
              </div>

              {/* Scrollable columns */}
              <div className="flex">
                {visibleColumns.map((column) => (
                  <div key={column.id} style={{ width: column.width || 200 }}>
                    <ColumnHeader column={column} onSort={handleSort} onHide={handleHideColumn} sortConfig={sortConfig} />
                  </div>
                ))}

                {/* Add Column button - Sticky Right */}
                <div className="sticky right-0 z-40 bg-gray-50 border-l border-gray-300 flex items-center justify-center" style={{ width: 48 }}>
                  <AddColumnPopover projectId={projectId} />
                </div>
              </div>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-auto">
            <SortableContext items={allDraggableIds} strategy={verticalListSortingStrategy}>
              {sections.map((section) => {
                const sectionTasks = tasksBySection[section.id] || [];
                const topLevelTasks = sectionTasks.filter((t) => !t.parentId);
                const isCollapsed = collapsedGroups[section.id];

                return (
                  <div key={section.id} className="border-b border-gray-200">
                    <GroupHeader
                      section={section}
                      taskCount={topLevelTasks.length}
                      isCollapsed={isCollapsed}
                      onToggleCollapse={handleToggleCollapse}
                    />
                    {!isCollapsed && (
                      <>
                        {topLevelTasks.map((task) => renderTaskWithSubtasks(task))}
                        <AddTaskRow sectionId={section.id} onAddTask={createTask} />
                      </>
                    )}
                  </div>
                );
              })}
            </SortableContext>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && (
            <div className="bg-white px-4 py-2 rounded shadow-xl border-2 border-blue-400">
              {activeId.toString().startsWith('section-')
                ? sections.find((s) => `section-${s.id}` === activeId)?.name
                : tasks.find((t) => t.id === activeId)?.title || tasks.find((t) => t.id === activeId)?.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailsDialog taskId={selectedTaskId} open={!!selectedTaskId} onClose={handleCloseTaskDetails} />
    </ListViewProvider>
  );
};

export default ListView;
