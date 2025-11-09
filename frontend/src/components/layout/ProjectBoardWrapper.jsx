import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ViewModeBar from '../project-board/ViewModeBar';
import ProjectBoardHeader from '../project-board/ProjectBoardHeader';
import { projectsService } from '../../services/api/projects.service';
import { useAuth } from '../../contexts/AuthContext';

const ProjectBoardWrapper = ({ children, currentView = 'list', onViewChange }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsService.getById(projectId);
      const projectData = response.data?.data?.project || response.data?.project || response.data;
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    // Navigate to dashboard after deleting
    navigate('/dashboard');
  };

  return (
    <>
      {/* Project Header */}
      <ProjectBoardHeader
        project={project}
        onProjectUpdate={fetchProject}
        onDelete={handleDelete}
      />

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
