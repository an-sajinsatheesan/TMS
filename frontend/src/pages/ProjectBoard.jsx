import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProjectBoardWrapper from '../components/layout/ProjectBoardWrapper';
import ProjectBoardContent from '../components/project-board/ProjectBoardContent';
import { useAuth } from '../contexts/AuthContext';

const ProjectBoard = () => {
  const { userId, projectId, viewMode } = useParams();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(viewMode || 'list');

  return (
    <AppLayout>
      <ProjectBoardWrapper>
        <ProjectBoardContent viewMode={currentView} />
      </ProjectBoardWrapper>
    </AppLayout>
  );
};

export default ProjectBoard;
