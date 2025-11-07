import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ViewModeBar from '../project-board/ViewModeBar';
import ProjectActionBar from '../project-board/ProjectActionBar';

const ProjectBoardWrapper = ({ children }) => {
  const { viewMode } = useParams();
  const [currentView, setCurrentView] = useState(viewMode || 'list');

  // Mock project data - replace with actual data from context/API
  const project = {
    name: 'Website Redesign Project',
    date: 'Created on January 15, 2024',
    status: 'active',
  };

  // Event handlers
  const handleViewChange = (view) => {
    setCurrentView(view);
    console.log('View changed to:', view);
  };

  const handleAddTask = (type) => {
    console.log('Add task type:', type);
  };

  const handleAddSection = () => {
    console.log('Add section');
  };

  const handleSort = () => {
    console.log('Open sort options');
  };

  const handleColumnCustomize = () => {
    console.log('Customize columns');
  };

  const handleFilter = () => {
    console.log('Open filters');
  };

  return (
    <>
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
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default ProjectBoardWrapper;
