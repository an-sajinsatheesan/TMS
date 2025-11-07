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
import { Plus } from 'lucide-react';
import GroupHeader from './GroupHeader';
import TaskRow from './TaskRow';
import AddTaskRow from './AddTaskRow';
import ColumnHeader from './ColumnHeader';
import AddColumnDialog from './AddColumnDialog';
import { cn } from '@/lib/utils';
import { useProjectData } from '@/hooks/useProjectData';
import { fetchColumns, updateColumn, clearColumns } from '@/store/slices/columnsSlice';

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
  drag: 'w-10',
  taskNumber: 'w-16',
  taskName: 'w-80',
  addColumn: 'w-12',
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
  } = useProjectData(projectId);

  // Redux columns state
  const { columns: reduxColumns, loading: columnsLoading } = useSelector((state) => state.columns);

  const [activeId, setActiveId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

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

  return (
    <>
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

              {/* Fixed Columns (System columns) */}
              {fixedColumns.map((column, index) => {
                const leftOffset = index === 0 ? 'left-10' : index === 1 ? 'left-26' : undefined;
                const widthClass = column.id === 'taskNumber' ? COLUMN_WIDTHS.taskNumber : COLUMN_WIDTHS.taskName;
                const shadowClass = index === fixedColumns.length - 1 ? 'shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]' : '';

                return (
                  <div
                    key={column.id}
                    className={cn(
                      widthClass,
                      'sticky z-20 bg-gray-50',
                      leftOffset,
                      shadowClass
                    )}
                  >
                    <ColumnHeader
                      column={column}
                      onSort={handleSort}
                      onHide={handleHideColumn}
                      onSwap={handleSwapColumn}
                      widthClass={widthClass}
                    />
                  </div>
                );
              })}

              {/* Scrollable Columns (Custom columns) */}
              {scrollableColumns.map((column) => {
                const widthClass = getColumnWidthClass(column.width);
                return (
                  <div key={column.id} className={widthClass}>
                    <ColumnHeader
                      column={column}
                      onSort={handleSort}
                      onHide={handleHideColumn}
                      onSwap={handleSwapColumn}
                      widthClass={widthClass}
                    />
                  </div>
                );
              })}

              {/* Add Column Button - Sticky Right */}
              <div className={cn(COLUMN_WIDTHS.addColumn, 'sticky right-0 z-20 bg-gray-50 border-l border-gray-200 flex items-center justify-center')}>
                <button
                  onClick={() => setIsAddColumnDialogOpen(true)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                  title="Add Column"
                >
                  <Plus className="w-4 h-4" />
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

      {/* Add Column Dialog */}
      <AddColumnDialog
        isOpen={isAddColumnDialogOpen}
        onClose={() => setIsAddColumnDialogOpen(false)}
        projectId={projectId}
      />
    </>
  );
};

export default ListView;
