import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ViewTabs from '../../components/project-views/shared/ViewTabs';
import ListView from '../../components/project-views/list-view/ListView';
import KanbanView from '../../components/project-views/kanban-view/KanbanView';
import TimelineView from '../../components/project-views/timeline-view/TimelineView';
import CalendarView from '../../components/project-views/calendar-view/CalendarView';
import TaskDetailSidebar from '../../components/project-views/shared/TaskDetailSidebar';
import { useProjectData } from '../../hooks/useProjectData';
import { useFiltersAndSort } from '../../hooks/useFiltersAndSort';
import { VIEW_MODES } from '../../constants/viewModes';
import { useProject } from '../../contexts/ProjectContext';

export default function ProjectBoard() {
  const { projectId, userId, viewMode } = useParams();
  const navigate = useNavigate();
  const { activeProject } = useProject();

  // Set active view from URL or default to list
  const [activeView, setActiveView] = useState(viewMode || VIEW_MODES.LIST);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Update active view when URL changes
  useEffect(() => {
    if (viewMode && Object.values(VIEW_MODES).includes(viewMode)) {
      setActiveView(viewMode);
    } else {
      setActiveView(VIEW_MODES.LIST);
    }
  }, [viewMode]);

  const {
    sections,
    tasks,
    loading,
    error,
    useDummyData,
    updateTask,
    createTask,
    deleteTask,
    moveTask,
    updateSection,
    createSection,
    createSubtask,
  } = useProjectData(projectId || 'proj-1'); // Use 'proj-1' as default for dummy data

  const {
    filters,
    sortBy,
    searchQuery,
    processedTasks,
    activeFilterCount,
    setSortBy,
    setSearchQuery,
    addFilter,
    removeFilter,
    clearFilters,
    setFilters,
  } = useFiltersAndSort(tasks);

  // Get the selected task object
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;

  const handleAddTask = (sectionId, taskType = 'task') => {
    const firstSection = sectionId || sections[0]?.id;
    if (!firstSection) return;
    createTask(firstSection, { type: taskType });
  };

  const handleAddSection = () => {
    createSection();
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle view change and update URL
  const handleViewChange = (newView) => {
    const userIdParam = userId || 'user-1'; // Default user ID for demo
    navigate(`/${userIdParam}/project/${projectId || 'proj-1'}/${newView}`);
  };

  const viewProps = {
    sections,
    tasks: processedTasks,
    onTaskClick: setSelectedTaskId,
    onTaskUpdate: updateTask,
    onTaskCreate: createTask,
    onTaskMove: moveTask,
    onSectionUpdate: updateSection,
    onAddTask: handleAddTask,
    onAddSection: handleAddSection,
    onTaskDelete: deleteTask,
    onTaskDuplicate: (taskId) => console.log('Duplicate task:', taskId), // TODO: Implement
    onCreateSubtask: createSubtask,
    filters,
    sortBy,
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ProgressSpinner />
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Project Header Info */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activeProject?.name || 'Project Board'}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your tasks across multiple views
            </p>
          </div>
          {useDummyData && (
            <Message
              severity="info"
              text="Using demo data - API connection unavailable"
              className="m-0"
            />
          )}
        </div>
      </div>

      {/* View Tabs with integrated toolbar */}
      <ViewTabs
        activeView={activeView}
        onViewChange={handleViewChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddTask={handleAddTask}
        onAddSection={handleAddSection}
        activeFilterCount={activeFilterCount}
        showColumnVisibility={activeView === VIEW_MODES.LIST}
      />

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === VIEW_MODES.LIST && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ListView {...viewProps} />
            </motion.div>
          )}

          {activeView === VIEW_MODES.KANBAN && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <KanbanView {...viewProps} />
            </motion.div>
          )}

          {activeView === VIEW_MODES.TIMELINE && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <TimelineView {...viewProps} />
            </motion.div>
          )}

          {activeView === VIEW_MODES.CALENDAR && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <CalendarView {...viewProps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Detail Sidebar */}
      <TaskDetailSidebar
        taskId={selectedTaskId}
        task={selectedTask}
        visible={!!selectedTaskId}
        onHide={() => setSelectedTaskId(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
