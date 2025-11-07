import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardLayout from '../components/project-board/ProjectBoardLayout';
import ProjectBoardContent from '../components/project-board/ProjectBoardContent';
import { useAuth } from '../contexts/AuthContext';

const ProjectBoard = () => {
  const { userId, projectId, viewMode } = useParams();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(viewMode || 'list');

  return (
    <ProjectBoardLayout>
      <ProjectBoardContent viewMode={currentView} />
    </ProjectBoardLayout>
  );
};

export default ProjectBoard;
