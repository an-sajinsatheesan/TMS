import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProjectBoardWrapper from '../components/layout/ProjectBoardWrapper';
import ProjectBoardContent from '../components/project-board/ProjectBoardContent';
import { useAuth } from '../contexts/AuthContext';
import { MembersProvider } from '../contexts/MembersContext';

const ProjectBoard = () => {
  const { userId, projectId, viewMode } = useParams();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(viewMode || 'list');

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  return (
    <AppLayout>
      <MembersProvider projectId={projectId}>
        <ProjectBoardWrapper currentView={currentView} onViewChange={handleViewChange}>
          <ProjectBoardContent viewMode={currentView} projectId={projectId} />
        </ProjectBoardWrapper>
      </MembersProvider>
    </AppLayout>
  );
};

export default ProjectBoard;
