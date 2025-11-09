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
import ProjectActionBar from '../ProjectActionBar';
import { cn } from '@/lib/utils';
import { useProjectData } from '@/hooks/useProjectData';
import { fetchColumns, updateColumn, clearColumns } from '@/store/slices/columnsSlice';
import { useMembers } from '@/contexts/MembersContext';
import { ListViewProvider } from '@/contexts/ListViewContext';
import { sectionsService } from '@/services/api/sections.service';
import { toast } from 'sonner';

// Column width mapping
const getColumnWidthClass = (width) => {
  if (width <= 64) return 'w-16';
  if (width <= 100) return 'w-24';
  if (width <= 150) return 'w-32';
  if (width <= 200) return 'w-48';
  if (width <= 300) return 'w-64';
  return 'w-80';
};

const COLUMN_WIDTHS = {
  checkbox: 'w-8',
  taskName: 'w-96',
  addColumn: 'w-8',
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

  // Redux columns state
  const { columns: reduxColumns, loading: columnsLoading } = useSelector((state) => state.columns);

  const [activeId, setActiveId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
  const [activeFilters, setActiveFilters] = useState({});

  const { users: projectMembers } = useMembers();

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

  // Fetch columns when projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchColumns(projectId));
    }

    return () => {
      // Clear columns when unmounting or project changes
      dispatch(clearColumns());
    };
  }, [projectId, dispatch]);

  // Group tasks by section with sorting
  const tasksBySection = useMemo(() => {
    const grouped = {};

    // Find tasks with null sectionId (these were created during onboarding before sections existed)
    const unassignedTasks = tasks.filter((task) => task.sectionId === null);

    sections.forEach((section, index) => {
      let sectionTasks = tasks.filter((task) => task.sectionId === section.id);

      // If this is the first section, add unassigned tasks to it
      if (index === 0 && unassignedTasks.length > 0) {
        sectionTasks = [...sectionTasks, ...unassignedTasks];
      }

      // Apply sorting if configured
      if (sortConfig.column && sortConfig.direction) {
        sectionTasks = sectionTasks.sort((a, b) => {
          let aValue = a[sortConfig.column];
          let bValue = b[sortConfig.column];

          // Handle custom fields
          if (a.customFields && a.customFields[sortConfig.column]) {
            aValue = a.customFields[sortConfig.column];
          }
          if (b.customFields && b.customFields[sortConfig.column]) {
            bValue = b.customFields[sortConfig.column];
          }

          // Handle null values
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;

          // Compare values
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      } else {
        // Default sorting by orderIndex
        sectionTasks.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      }

      grouped[section.id] = sectionTasks;
    });
    return grouped;
  }, [sections, tasks, sortConfig]);

  // Get visible columns
  const visibleColumns = useMemo(
    () => reduxColumns.filter((col) => col.visible),
    [reduxColumns]
  );

  const fixedColumns = useMemo(
    () => visibleColumns.filter((col) => col.isSystem),
    [visibleColumns]
  );

  const scrollableColumns = useMemo(
    () => visibleColumns.filter((col) => !col.isSystem),
    [visibleColumns]
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Check if dragging a section
    if (active.id.toString().startsWith('section-')) {
      // Extract section IDs from the string IDs
      const activeSectionId = active.id.toString().replace('section-', '');
      const overSectionId = over.id.toString().replace('section-', '');

      // Find current positions
      const oldIndex = sections.findIndex(s => s.id === activeSectionId);
      const newIndex = sections.findIndex(s => s.id === overSectionId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        try {
          // Create new ordered array
          const reorderedSections = [...sections];
          const [removed] = reorderedSections.splice(oldIndex, 1);
          reorderedSections.splice(newIndex, 0, removed);

          // Get array of section IDs in new order
          const sectionIds = reorderedSections.map(s => s.id);

          // Call API to persist the reordering
          await sectionsService.reorder(projectId, sectionIds);

          toast.success('Section reordered successfully');
          // The data will be refreshed by useProjectData hook
        } catch (err) {
          console.error('Failed to reorder sections:', err);
          toast.error('Failed to reorder section');
        }
      }
    } else {
      // Dragging a task
      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) {
        setActiveId(null);
        return;
      }

      // Determine the destination section and index
      let destinationSectionId = activeTask.sectionId;
      let destinationIndex = 0;

      // Check if dropped on another task
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        destinationSectionId = overTask.sectionId;
        const sectionTasks = tasksBySection[destinationSectionId].filter((t) => !t.parentId);
        destinationIndex = sectionTasks.findIndex((t) => t.id === over.id);
      }

      // Move task if section changed OR position changed within same section
      const isSectionChanged = destinationSectionId !== activeTask.sectionId;
      const currentSectionTasks = tasksBySection[activeTask.sectionId]?.filter((t) => !t.parentId) || [];
      const currentIndex = currentSectionTasks.findIndex((t) => t.id === active.id);
      const isPositionChanged = currentIndex !== destinationIndex;

      if (isSectionChanged || isPositionChanged) {
        try {
          await moveTask(active.id, destinationSectionId, destinationIndex);
          toast.success('Task moved successfully');
        } catch (err) {
          console.error('Failed to move task:', err);
          toast.error('Failed to move task');
        }
      }
    }

    setActiveId(null);
  };

  const handleToggleCollapse = (sectionId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
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
      console.error('Failed to toggle task completion:', err);
    }
  };

  const handleAssigneeChange = async (taskId, userId) => {
    try {
      await updateTask(taskId, {
        assigneeId: userId,
      });
    } catch (err) {
      console.error('Failed to update task assignee:', err);
    }
  };

  const handleDateChange = async (taskId, date) => {
    try {
      await updateTask(taskId, {
        dueDate: date,
      });
    } catch (err) {
      console.error('Failed to update task due date:', err);
    }
  };

  const handleSelectChange = async (taskId, columnId, value) => {
    try {
      const column = reduxColumns.find(col => col.id === columnId);
      if (!column) return;

      // Map column name to task field for default fields
      const fieldMapping = {
        'Priority': 'priority',
        'Status': 'status',
      };

      let updatePayload;

      if (fieldMapping[column.name]) {
        // Standard field (Priority, Status)
        updatePayload = {
          [fieldMapping[column.name]]: value,
        };
      } else {
        // Custom field - wrap in customFields object
        updatePayload = {
          customFields: {
            [columnId]: value,
          },
        };
      }

      await updateTask(taskId, updatePayload);
    } catch (err) {
      console.error('Failed to update select field:', err);
      toast.error('Failed to update field');
    }
  };

  const handleTaskNameSave = async (taskId, newName) => {
    try {
      await updateTask(taskId, {
        title: newName,
      });
    } catch (err) {
      console.error('Failed to update task name:', err);
      throw err; // Re-throw so EditableTaskName can handle it
    }
  };

  const handleAddTaskToSection = async (sectionId, taskName) => {
    if (!taskName.trim()) return;

    try {
      await createTask(sectionId, { title: taskName.trim() });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Context menu handlers
  const handleDuplicateTask = async (taskId) => {
    try {
      await duplicateTask(taskId);
      toast.success('Task duplicated successfully');
    } catch (err) {
      console.error('Failed to duplicate task:', err);
      toast.error('Failed to duplicate task');
    }
  };

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleOpenTaskDetails = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskDetails = () => {
    setSelectedTaskId(null);
  };

  const handleCreateSubtask = async (taskId) => {
    try {
      await createSubtask(taskId, {
        title: 'New Subtask',
      });
      toast.success('Subtask created successfully');
    } catch (err) {
      console.error('Failed to create subtask:', err);
      toast.error('Failed to create subtask');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Failed to delete task');
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleSortChange = (sortData) => {
    if (sortData) {
      setSortConfig({ column: sortData.field, direction: sortData.direction });
    } else {
      setSortConfig({ column: null, direction: null });
    }
  };

  const handleColumnVisibilityChange = async (columnId, visible) => {
    const column = reduxColumns.find((col) => col.id === columnId);
    if (!column || column.isSystem) return;

    try {
      await dispatch(updateColumn({
        projectId,
        columnId,
        updates: { visible },
      })).unwrap();
    } catch (err) {
      console.error('Failed to update column visibility:', err);
    }
  };

  const handleSort = (columnId, direction) => {
    setSortConfig({ column: columnId, direction });
  };

  const handleHideColumn = async (columnId) => {
    // Find the column
    const column = reduxColumns.find((col) => col.id === columnId);
    if (!column || column.isSystem) return; // Don't hide system columns

    try {
      await dispatch(updateColumn({
        projectId,
        columnId,
        updates: { visible: false },
      })).unwrap();
    } catch (err) {
      console.error('Failed to hide column:', err);
    }
  };

  const handleSwapColumn = (columnId) => {
    // Placeholder for column swapping logic
    console.log('Swap column:', columnId);
  };

  // Render task and its subtasks
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
          columnWidths={COLUMN_WIDTHS}
        />
        {task.isExpanded &&
          subtasks.map((subtask) => renderTaskWithSubtasks(subtask, level + 1))}
      </div>
    );
  };

  // Get all draggable IDs (sections and top-level tasks)
  const sectionIds = sections.map((s) => `section-${s.id}`);
  const topLevelTaskIds = tasks.filter((t) => !t.parentId).map((t) => t.id);
  const allDraggableIds = [...sectionIds, ...topLevelTaskIds];

  // Loading state
  if (tasksLoading || columnsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {tasksError}</div>
      </div>
    );
  }

  const listViewContextValue = {
    columns: reduxColumns,
    activeFilters,
    activeSort: sortConfig.column ? { field: sortConfig.column, direction: sortConfig.direction } : null,
    projectMembers,
    onFilterChange: handleFilterChange,
    onSortChange: handleSortChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
  };

  const handleAddTask = (type) => {
    console.log('Add task type:', type);
  };

  const handleAddSection = () => {
    console.log('Add section');
  };

  return (
    <ListViewProvider value={listViewContextValue}>
      <div className="flex flex-col h-full">
        {/* Project Action Bar */}
        <ProjectActionBar
          onAddTask={handleAddTask}
          onAddSection={handleAddSection}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Main Scrollable Container */}
          <div className="relative h-[calc(100vh-170px)] overflow-auto" id="scroll-container">
          {/* Header Row */}
          <div className="flex w-max min-w-full sticky top-0 z-40 bg-gray-100">
            {/* Drag Handle Column Header - Sticky Left */}
            <div
              className={cn(
                COLUMN_WIDTHS.checkbox,
                'sticky left-0 z-50 flex-shrink-0 border-r border-b p-1 bg-gray-100 text-xs flex items-center justify-center'
              )}
            >
              <span className="text-gray-400">⋮⋮</span>
            </div>

            {/* Task Name Column Header - Sticky Left */}
            <div
              className={cn(
                COLUMN_WIDTHS.taskName,
                'sticky left-8 z-50 flex-shrink-0 border-r border-b px-2 py-1 bg-gray-100 text-xs font-semibold'
              )}
            >
              Task Name
            </div>

            {/* Scrollable header cells */}
            <div className="flex-1 flex border-b">
              {scrollableColumns.map((column) => {
                const widthClass = getColumnWidthClass(column.width);
                return (
                  <div
                    key={column.id}
                    className={cn(widthClass, 'border-r')}
                  >
                    <ColumnHeader
                      column={column}
                      onSort={handleSort}
                      onHide={handleHideColumn}
                      sortConfig={sortConfig}
                    />
                  </div>
                );
              })}
            </div>

            {/* Fixed Right Column (Sticky) */}
            <div className={cn(
              COLUMN_WIDTHS.addColumn,
              'sticky right-0 z-50 flex-shrink-0 border-l border-b bg-gray-100 flex items-center justify-center'
            )}>
              <AddColumnPopover projectId={projectId} />
            </div>
          </div>

          {/* Scrollable Content Body */}
          <SortableContext items={allDraggableIds} strategy={verticalListSortingStrategy}>
            {sections.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No sections found. Create a section to get started.
              </div>
            ) : (
              sections.map((section) => {
                const sectionTasks = tasksBySection[section.id] || [];
                const topLevelTasks = sectionTasks.filter((t) => !t.parentId);
                const isCollapsed = collapsedGroups[section.id];

                return (
                  <div key={section.id}>
                    {/* Sticky Group Title */}
                    <GroupHeader
                      section={section}
                      taskCount={topLevelTasks.length}
                      isCollapsed={isCollapsed}
                      onToggleCollapse={handleToggleCollapse}
                      columnWidths={COLUMN_WIDTHS}
                      scrollableColumns={scrollableColumns}
                    />

                    {/* Task Rows */}
                    {!isCollapsed && (
                      <div>
                        {topLevelTasks.map((task) => renderTaskWithSubtasks(task))}

                        {/* Add Task Row */}
                        <AddTaskRow
                          sectionId={section.id}
                          onAddTask={handleAddTaskToSection}
                          columnWidths={COLUMN_WIDTHS}
                          scrollableColumns={scrollableColumns}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white px-3 py-1.5 rounded shadow-lg border border-gray-300 text-sm">
              {activeId.toString().startsWith('section-')
                ? sections.find((s) => `section-${s.id}` === activeId)?.name
                : tasks.find((t) => t.id === activeId)?.title || tasks.find((t) => t.id === activeId)?.name}
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
    </ListViewProvider>
  );
};

export default ListView;
