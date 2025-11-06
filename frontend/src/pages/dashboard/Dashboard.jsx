import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { MembersProvider } from '../../contexts/MembersContext';
import { motion, AnimatePresence } from 'framer-motion';
import { tenantService } from '../../api/tenant.service';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ProjectHeader from '../../components/dashboard/ProjectHeader';
import ProjectTabs from '../../components/dashboard/ProjectTabs';
import ListView from '../../components/project-views/list-view/ListView';
import KanbanView from '../../components/project-views/kanban-view/KanbanView';
import TimelineView from '../../components/project-views/timeline-view/TimelineView';
import CalendarView from '../../components/project-views/calendar-view/CalendarView';
import TaskDetailSidebar from '../../components/project-views/shared/TaskDetailSidebar';
import ViewToolbar from '../../components/project-views/shared/ViewToolbar';
import { useProjectData } from '../../hooks/useProjectData';
import { useFiltersAndSort } from '../../hooks/useFiltersAndSort';
import { VIEW_MODES } from '../../constants/viewModes';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { activeProject, projects, selectProject } = useProject();
  const params = useParams();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(params.viewMode || 'list');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const navigate = useNavigate();

  // Get projectId from URL or use activeProject
  const projectIdFromUrl = params.projectId;
  const currentProjectId = projectIdFromUrl || activeProject?.id;

  // Project data - use project ID from URL or active project
  const {
    sections,
    tasks,
    loading: dataLoading,
    error: dataError,
    updateTask,
    createTask,
    deleteTask,
    moveTask,
    updateSection,
    createSection,
    deleteSection,
  } = useProjectData(currentProjectId);

  // Filters and sorting
  const {
    filters,
    sortBy,
    searchQuery,
    processedTasks,
    activeFilterCount,
    setFilters,
    setSortBy,
    setSearchQuery,
  } = useFiltersAndSort(tasks || []);

  useEffect(() => {
    loadTenants();
  }, []);

  // Handle navigation when first visiting dashboard or when projects load
  // FIXED: Removed activeTab from deps to prevent infinite loop
  useEffect(() => {
    if (!projectIdFromUrl && activeProject && user) {
      // If on /dashboard without projectId, redirect to first project
      const defaultView = params.viewMode || 'list';
      navigate(`/dashboard/${user.id}/${activeProject.id}/${defaultView}`, { replace: true });
    } else if (projectIdFromUrl && projects.length > 0 && !activeProject) {
      // If URL has projectId but no active project, find and select it
      const project = projects.find(p => p.id === projectIdFromUrl);
      if (project) {
        selectProject(project);
      }
    }
  }, [projectIdFromUrl, activeProject, projects, user, params.viewMode]);

  // Update activeTab when viewMode changes in URL
  useEffect(() => {
    if (params.viewMode && params.viewMode !== activeTab) {
      setActiveTab(params.viewMode);
    }
  }, [params.viewMode, activeTab]);

  const loadTenants = async () => {
    try {
      const response = await tenantService.getTenants();
      setTenants(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Update URL with new view mode
    if (currentProjectId && user) {
      navigate(`/dashboard/${user.id}/${currentProjectId}/${newTab}`);
    }
  };

  // Sample team members data
  const teamMembers = [
    { name: 'Alice', initials: 'AL', color: '#E91E63' },
    { name: 'David', initials: 'D1', color: '#4CAF50' },
  ];

  // Handlers for view interactions
  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const handleTaskClose = () => {
    setSelectedTaskId(null);
  };

  const handleAddTask = (sectionId) => {
    createTask(sectionId);
  };

  const handleAddSection = () => {
    createSection({ name: 'New Section' });
  };

  const handleDuplicateTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      createTask(task.sectionId, { ...task, id: undefined, name: `${task.name} (Copy)` });
    }
  };

  const handleCreateSubtask = (parentTaskId) => {
    const parentTask = tasks.find(t => t.id === parentTaskId);
    if (parentTask) {
      createTask(parentTask.sectionId, {
        title: '', // Empty title, user will fill it in
        parentId: parentTaskId,
        level: (parentTask.level || 0) + 1,
      });
      // Note: subtaskCount and isExpanded are calculated from the database, not stored
    }
  };

  // Render the appropriate view based on activeTab
  const renderView = () => {
    const viewProps = {
      sections: sections || [],
      tasks: processedTasks || [],
      onTaskClick: handleTaskClick,
      onTaskUpdate: updateTask,
      onTaskDelete: deleteTask,
      onTaskMove: moveTask,
      onSectionUpdate: updateSection,
      onAddTask: handleAddTask,
      onAddSection: handleAddSection,
      onTaskDuplicate: handleDuplicateTask,
      onCreateSubtask: handleCreateSubtask,
    };

    switch (activeTab) {
      case VIEW_MODES.LIST:
        return <ListView {...viewProps} />;
      case VIEW_MODES.KANBAN:
        return <KanbanView {...viewProps} />;
      case VIEW_MODES.TIMELINE:
        return <TimelineView {...viewProps} />;
      case VIEW_MODES.CALENDAR:
        return <CalendarView {...viewProps} />;
      default:
        return <ListView {...viewProps} />;
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading your project...</p>
        </div>
      </div>
    );
  }

  return (
    <MembersProvider projectId={currentProjectId}>
      <DashboardLayout>
        {/* Project Header */}
        <ProjectHeader
          projectName="Craftboard Project"
          projectIcon="C"
          projectColor="bg-purple-500"
          teamMembers={teamMembers}
        />

        {/* Project Tabs */}
        <ProjectTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* View Toolbar */}
        <ViewToolbar
          filters={filters}
          sortBy={sortBy}
          searchQuery={searchQuery}
          activeFilterCount={activeFilterCount}
          onFiltersChange={setFilters}
          onSortChange={setSortBy}
          onSearchChange={setSearchQuery}
          onAddTask={() => handleAddTask(sections[0]?.id)}
        />

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Error Display */}
          {(error || dataError) && (
            <div className="p-4 mx-8 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error || dataError}
            </div>
          )}

          {/* Project Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Task Detail Sidebar */}
        {selectedTaskId && (
          <TaskDetailSidebar
            taskId={selectedTaskId}
            task={tasks.find((t) => t.id === selectedTaskId)}
            visible={!!selectedTaskId}
            onHide={handleTaskClose}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}
      </DashboardLayout>
    </MembersProvider>
  );
};

export default Dashboard;
