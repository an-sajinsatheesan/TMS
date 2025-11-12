import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { tenantsService } from '../services/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all workspaces for the current user
  const fetchWorkspaces = useCallback(async () => {
    if (!user?.id) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await tenantsService.getAll();
      const workspacesData = response?.data?.tenants || [];

      setWorkspaces(workspacesData);

      // Set current workspace from localStorage or use first workspace
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (savedWorkspaceId && workspacesData.find(w => w.id === savedWorkspaceId)) {
        const workspace = workspacesData.find(w => w.id === savedWorkspaceId);
        setCurrentWorkspace(workspace);
      } else if (workspacesData.length > 0) {
        setCurrentWorkspace(workspacesData[0]);
        localStorage.setItem('currentWorkspaceId', workspacesData[0].id);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch workspaces on mount and when user changes
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Switch to a different workspace
  const switchWorkspace = useCallback((workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
  }, []);

  // Refresh current workspace data
  const refreshCurrentWorkspace = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      const response = await tenantsService.getSettings(currentWorkspace.id);
      const updatedWorkspace = response?.data?.tenant;
      if (updatedWorkspace) {
        setCurrentWorkspace(updatedWorkspace);
        // Update in workspaces list too
        setWorkspaces(prev =>
          prev.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w)
        );
      }
    } catch (err) {
      console.error('Error refreshing workspace:', err);
    }
  }, [currentWorkspace?.id]);

  const value = {
    workspaces,
    currentWorkspace,
    loading,
    error,
    switchWorkspace,
    refreshWorkspaces: fetchWorkspaces,
    refreshCurrentWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

WorkspaceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
