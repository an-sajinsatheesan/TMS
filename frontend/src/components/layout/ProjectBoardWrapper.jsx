import ViewModeBar from '../project-board/ViewModeBar';

const ProjectBoardWrapper = ({ children, currentView = 'list', onViewChange }) => {
  return (
    <>
      {/* Fixed View Mode Bar */}
      <ViewModeBar
        currentView={currentView}
        onViewChange={onViewChange}
      />

      {/* Scrollable Content Area with Action Bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </>
  );
};

export default ProjectBoardWrapper;
