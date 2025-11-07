import { useMemo, useState } from 'react';
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
import {
  toggleGroupCollapse,
  reorderSections,
  reorderTasks,
  toggleTaskCompletion,
  addTask,
  toggleColumnVisibility,
  setSortConfig,
} from '@/store/slices/listViewSlice';
import { cn } from '@/lib/utils';

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

const ListView = () => {
  const dispatch = useDispatch();
  const { sections, tasks, collapsedGroups, columns, sortConfig } = useSelector(
    (state) => state.listView
  );

  const [activeId, setActiveId] = useState(null);

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
        .sort((a, b) => a.orderIndex - b.orderIndex);
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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Check if dragging a section
    if (active.id.toString().startsWith('section-')) {
      const activeSectionId = active.id.toString().replace('section-', '');
      const overSectionId = over.id.toString().replace('section-', '');

      const oldIndex = sections.findIndex((s) => s.id === activeSectionId);
      const newIndex = sections.findIndex((s) => s.id === overSectionId);

      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(reorderSections({ sourceIndex: oldIndex, destinationIndex: newIndex }));
      }
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
        const sectionTasks = tasksBySection[destinationSectionId].filter((t) => t.level === 0);
        destinationIndex = sectionTasks.findIndex((t) => t.id === over.id);
      }

      dispatch(
        reorderTasks({
          taskId: active.id,
          sourceSectionId: activeTask.sectionId,
          destinationSectionId,
          destinationIndex,
        })
      );
    }

    setActiveId(null);
  };

  const handleToggleCollapse = (sectionId) => {
    dispatch(toggleGroupCollapse(sectionId));
  };

  const handleToggleComplete = (taskId) => {
    dispatch(toggleTaskCompletion(taskId));
  };

  const handleAddTask = (sectionId, taskName) => {
    dispatch(addTask({ sectionId, taskName }));
  };

  const handleSort = (columnId, direction) => {
    dispatch(setSortConfig({ column: columnId, direction }));
  };

  const handleHideColumn = (columnId) => {
    dispatch(toggleColumnVisibility(columnId));
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
  const topLevelTaskIds = tasks.filter((t) => t.level === 0).map((t) => t.id);
  const allDraggableIds = [...sectionIds, ...topLevelTaskIds];

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
            {sections.map((section) => {
              const sectionTasks = tasksBySection[section.id] || [];
              const topLevelTasks = sectionTasks.filter((t) => t.level === 0);
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
            })}
          </SortableContext>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white px-3 py-1.5 rounded shadow-lg border border-gray-300 text-sm">
            {activeId.toString().startsWith('section-')
              ? sections.find((s) => `section-${s.id}` === activeId)?.name
              : tasks.find((t) => t.id === activeId)?.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ListView;
