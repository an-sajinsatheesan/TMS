import { useState, cloneElement, Children } from 'react';
import { useParams } from 'react-router-dom';
import ViewModeBar from '../project-board/ViewModeBar';

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

  return (
    <>
      {/* Fixed View Mode Bar */}
      <ViewModeBar
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Scrollable Content Area with Action Bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </>
  );
};

export default ProjectBoardWrapper;
