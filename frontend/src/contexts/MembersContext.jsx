import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { projectMembersService } from '../services/api';
import { useAuth } from './AuthContext';

const MembersContext = createContext();

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error('useMembers must be used within MembersProvider');
  }
  return context;
};

const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const MembersProvider = ({ projectId, children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  // Fetch members ONCE for entire project
  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      if (!projectId || !currentUser) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await projectMembersService.getAll(projectId);
        const members = response?.data?.data || [];

        if (!isMounted) return;

        // Map members to user format with colors
        const mappedUsers = members.map((member, index) => ({
          id: member.userId,
          name: member.user?.fullName || member.user?.email || 'Unknown User',
          email: member.user?.email,
          avatar: member.user?.avatarUrl,
          color: colorPalette[index % colorPalette.length],
          role: member.role,
        }));

        // Ensure current user is in the list
        const currentUserInList = mappedUsers.find(u => u.id === currentUser.id);
        if (!currentUserInList && currentUser) {
          mappedUsers.unshift({
            id: currentUser.id,
            name: currentUser.fullName || currentUser.email || 'You',
            email: currentUser.email,
            avatar: currentUser.avatarUrl,
            color: colorPalette[0],
            role: 'OWNER',
          });
        }

        setUsers(mappedUsers);
      } catch (err) {
        console.error('Error fetching project members:', err);
        if (isMounted) {
          setError(err.message);
          // Fallback to current user
          if (currentUser) {
            setUsers([{
              id: currentUser.id,
              name: currentUser.fullName || currentUser.email || 'You',
              email: currentUser.email,
              avatar: currentUser.avatarUrl,
              color: colorPalette[0],
              role: 'OWNER',
            }]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [projectId, currentUser]);

  const refreshMembers = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const response = await projectMembersService.getAll(projectId);
      const members = response?.data?.data || [];

      const mappedUsers = members.map((member, index) => ({
        id: member.userId,
        name: member.user?.fullName || member.user?.email || 'Unknown User',
        email: member.user?.email,
        avatar: member.user?.avatarUrl,
        color: colorPalette[index % colorPalette.length],
        role: member.role,
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error refreshing members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const value = useMemo(() => ({
    users,
    loading,
    error,
    refreshMembers,
  }), [users, loading, error, refreshMembers]);

  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
};

MembersProvider.propTypes = {
  projectId: PropTypes.string,
  children: PropTypes.node.isRequired,
};
