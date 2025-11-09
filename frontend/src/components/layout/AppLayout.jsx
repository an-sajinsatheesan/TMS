import { useState } from 'react';
import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import { cn } from '@/lib/utils';

const AppLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // Determine if we're on a project board page
  const isProjectBoard = location.pathname.startsWith('/project-board');

  const handleAddProject = () => {
    navigate('/project-templates');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onAddProject={handleAddProject}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Dynamic Header */}
        <AppHeader isProjectBoard={isProjectBoard} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
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

export default AppLayout;
