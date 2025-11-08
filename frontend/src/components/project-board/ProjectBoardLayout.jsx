import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectBoardHeader from './ProjectBoardHeader';
import ViewModeBar from './ViewModeBar';
import ProjectActionBar from './ProjectActionBar';
import { cn } from '@/lib/utils';

const ProjectBoardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('list');

  // Mock project data - replace with actual data from context/props
  const project = {
    name: 'Website Redesign Project',
    date: 'Created on January 15, 2024',
    status: 'active',
  };

  // Event handlers
  const handleStatusChange = (status) => {
    console.log('Status changed to:', status);
    // Handle status change logic
  };

  const handleDelete = () => {
    console.log('Delete project');
    // Handle delete logic
  };

  const handleInvite = () => {
    console.log('Invite members');
    // Handle invite logic
  };

  const handleSettings = () => {
    console.log('Open settings');
    // Handle settings logic
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    console.log('View changed to:', view);
  };

  const handleAddTask = (type) => {
    console.log('Add task type:', type);
    // Handle add task logic
  };

  const handleAddSection = () => {
    console.log('Add section');
    // Handle add section logic
  };

  const handleSort = () => {
    console.log('Open sort options');
    // Handle sort logic
  };

  const handleColumnCustomize = () => {
    console.log('Customize columns');
    // Handle column customization logic
  };

  const handleFilter = () => {
    console.log('Open filters');
    // Handle filter logic
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Fixed Header */}
        <ProjectBoardHeader
          project={project}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onInvite={handleInvite}
          onSettings={handleSettings}
        />

        {/* Fixed View Mode Bar */}
        <ViewModeBar
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {/* Fixed Project Action Bar */}
        <ProjectActionBar
          onAddTask={handleAddTask}
          onAddSection={handleAddSection}
          onSort={handleSort}
          onColumnCustomize={handleColumnCustomize}
          onFilter={handleFilter}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default ProjectBoardLayout;
