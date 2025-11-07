import { useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { useProjectData } from '@/hooks/useProjectData';

// Column width constants for consistent alignment
const COLUMN_WIDTHS = {
  drag: 'w-10',
  taskNumber: 'w-16',
  taskName: 'w-80',
  assignee: 'w-48',
  status: 'w-32',
  dueDate: 'w-36',
  priority: 'w-28',
  startDate: 'w-36',
  tags: 'w-40',
  addColumn: 'w-12',
};

// Default columns configuration
const DEFAULT_COLUMNS = [
  { id: 'taskNumber', label: '#', visible: true, fixed: true, width: 64 },
  { id: 'taskName', label: 'Task Name', visible: true, fixed: true, width: 320 },
  { id: 'assignee', label: 'Assignee', visible: true, fixed: false, width: 192 },
  { id: 'status', label: 'Status', visible: true, fixed: false, width: 128 },
  { id: 'dueDate', label: 'Due Date', visible: true, fixed: false, width: 144 },
  { id: 'priority', label: 'Priority', visible: true, fixed: false, width: 112 },
  { id: 'startDate', label: 'Start Date', visible: false, fixed: false, width: 144 },
  { id: 'tags', label: 'Tags', visible: false, fixed: false, width: 160 },
];

const ListView = ({ projectId }) => {
  const {
    sections,
    tasks,
    loading,
    error,
    updateTask,
    createTask,
    deleteTask,
    moveTask,
    updateSection,
    createSection,
    deleteSection,
    createSubtask,
  } = useProjectData(projectId);

  const [activeId, setActiveId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });

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

  // Group tasks by section
  const tasksBySection = useMemo(() => {
    const grouped = {};
    sections.forEach((section) => {
      grouped[section.id] = tasks
        .filter((task) => task.sectionId === section.id)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    });
    return grouped;
  }, [sections, tasks]);

  // Get visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible),
    [columns]
  );

  const fixedColumns = useMemo(
    () => visibleColumns.filter((col) => col.fixed),
    [visibleColumns]
  );

  const scrollableColumns = useMemo(
    () => visibleColumns.filter((col) => !col.fixed),
    [visibleColumns]
  );

  // Calculate total width for fixed columns
  const fixedColumnsWidth = useMemo(
    () => fixedColumns.reduce((sum, col) => sum + (col.width || 0), 0) + 40, // +40 for drag icon
    [fixedColumns]
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
      // Section reordering would require a backend API endpoint
      console.log('Section reordering not yet implemented');
    } else {
      // Dragging a task
      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      // Determine the destination section
      let destinationSectionId = activeTask.sectionId;
      let destinationIndex = 0;

      // Check if dropped on another task
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        destinationSectionId = overTask.sectionId;
        const sectionTasks = tasksBySection[destinationSectionId].filter((t) => !t.parentId);
        destinationIndex = sectionTasks.findIndex((t) => t.id === over.id);
      }

      // Only move if section changed
      if (destinationSectionId !== activeTask.sectionId) {
        try {
          await moveTask(active.id, destinationSectionId, destinationIndex);
        } catch (err) {
          console.error('Failed to move task:', err);
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

  const handleAddTask = async (sectionId, taskName) => {
    if (!taskName.trim()) return;

    try {
      await createTask(sectionId, { title: taskName.trim() });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleSort = (columnId, direction) => {
    setSortConfig({ column: columnId, direction });
  };

  const handleHideColumn = (columnId) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: false } : col
      )
    );
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
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading tasks...</div>
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Fixed Header - No Scroll */}
        <div className="sticky top-0 z-40 bg-gray-50 border-b-2 border-gray-300">
          <div className="flex w-max min-w-full">
            {/* Drag Icon Column - Sticky Left */}
            <div className={cn(COLUMN_WIDTHS.drag, 'sticky left-0 z-20 bg-gray-50 border-r border-gray-200')} />

            {/* Task Number Column - Sticky Left */}
            <div className={cn(COLUMN_WIDTHS.taskNumber, 'sticky left-10 z-20 bg-gray-50')}>
              <ColumnHeader
                column={{ id: 'taskNumber', label: '#' }}
                onSort={handleSort}
                onHide={handleHideColumn}
                onSwap={handleSwapColumn}
                widthClass={COLUMN_WIDTHS.taskNumber}
              />
            </div>

            {/* Task Name Column - Sticky Left */}
            <div className={cn(COLUMN_WIDTHS.taskName, 'sticky left-26 z-20 bg-gray-50 shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]')}>
              <ColumnHeader
                column={{ id: 'taskName', label: 'Task Name' }}
                onSort={handleSort}
                onHide={handleHideColumn}
                onSwap={handleSwapColumn}
                widthClass={COLUMN_WIDTHS.taskName}
              />
            </div>

            {/* Scrollable Columns */}
            {scrollableColumns.map((column) => (
              <div key={column.id} className={COLUMN_WIDTHS[column.id] || 'w-40'}>
                <ColumnHeader
                  column={column}
                  onSort={handleSort}
                  onHide={handleHideColumn}
                  onSwap={handleSwapColumn}
                  widthClass={COLUMN_WIDTHS[column.id] || 'w-40'}
                />
              </div>
            ))}

            {/* Add Column Button - Sticky Right */}
            <div className={cn(COLUMN_WIDTHS.addColumn, 'sticky right-0 z-20 bg-gray-50 border-l border-gray-200 flex items-center justify-center')}>
              <button className="text-gray-500 hover:text-gray-700 transition-colors text-lg font-semibold">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body - Single Scroll */}
        <div className="overflow-auto h-[calc(100vh-280px)]">
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
                  <div key={section.id} className="border-b border-gray-200 last:border-b-0">
                    {/* Group Header */}
                    <GroupHeader
                      section={section}
                      taskCount={topLevelTasks.length}
                      isCollapsed={isCollapsed}
                      onToggleCollapse={handleToggleCollapse}
                      columnWidths={COLUMN_WIDTHS}
                    />

                    {/* Tasks */}
                    {!isCollapsed && (
                      <div>
                        {topLevelTasks.map((task) => renderTaskWithSubtasks(task))}

                        {/* Add Task Row */}
                        <AddTaskRow
                          sectionId={section.id}
                          onAddTask={handleAddTask}
                          columnWidths={COLUMN_WIDTHS}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </SortableContext>
        </div>
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
  );
};

export default ListView;
