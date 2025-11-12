import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { projectsService } from '../services/api';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadInitialProjects = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (isMounted) { setLoading(false); setInitialized(true); }
        return;
      }
      setLoading(true); setError(null);
      try {
        const response = await projectsService.getAll();
        const projectsData = response?.data || [];
        if (!isMounted) return;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        if (projectsData.length > 0) { setActiveProject(projectsData[0]); }
        setInitialized(true);
      } catch (err) {
        console.error('Failed to load projects:', err);
        if (isMounted) { setError(err.message || 'Failed to load projects'); setProjects([]); }
      } finally {
        if (isMounted) { setLoading(false); }
      }
    };
    loadInitialProjects();
    return () => { isMounted = false; };
  }, []);

  const refreshProjects = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const response = await projectsService.getAll();
      const projectsData = response?.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      if (!activeProject && projectsData.length > 0) { setActiveProject(projectsData[0]); }
      setInitialized(true);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.message || 'Failed to load projects'); setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  const selectProject = useCallback((project) => { setActiveProject(project); }, []);

  const createProject = useCallback(async (projectData) => {
    try {
      const response = await projectsService.create(projectData);
      const newProject = response?.data?.data || response?.data;
      setProjects(prev => [...prev, newProject]);
      setActiveProject(newProject);
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (projectId, updates) => {
    try {
      const response = await projectsService.update(projectId, updates);
      const updatedProject = response.data;
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      setActiveProject(prev => prev?.id === projectId ? updatedProject : prev);
      return updatedProject;
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err;
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      await projectsService.delete(projectId);
      setProjects(prev => {
        const filtered = prev.filter(p => p.id !== projectId);
        setActiveProject(current => current?.id === projectId ? (filtered[0] || null) : current);
        return filtered;
      });
    } catch (err) {
      console.error('Failed to delete project:', err);
      throw err;
    }
  }, []);

  const value = useMemo(() => ({
    projects, activeProject, loading, error, initialized,
    selectProject, createProject, updateProject, deleteProject, refreshProjects,
  }), [projects, activeProject, loading, error, initialized, selectProject, createProject, updateProject, deleteProject, refreshProjects]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

ProjectProvider.propTypes = { children: PropTypes.node.isRequired };
