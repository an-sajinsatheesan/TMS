import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateProjectModal from '../modals/CreateProjectModal';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
  const [showProjectsMenu, setShowProjectsMenu] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { projects, activeProject, selectProject, loading, refreshProjects } = useProject();

  // Load projects when sidebar mounts
  useEffect(() => {
    refreshProjects();
  }, []);

  const mainMenuItems = [
    { id: 'search', label: 'Search', icon: 'pi pi-search', path: '/search' },
    { id: 'notification', label: 'Notification', icon: 'pi pi-bell', path: '/notifications', badge: '99+' },
    { id: 'calendar', label: 'Calendar', icon: 'pi pi-calendar', path: '/calendar' },
    { id: 'settings', label: 'Settings', icon: 'pi pi-cog', path: '/settings' },
  ];

  const getProjectInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getProjectColor = (index) => {
    const colors = ['bg-purple-500', 'bg-gray-700', 'bg-orange-500', 'bg-blue-500', 'bg-purple-700', 'bg-green-500', 'bg-red-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  const handleProjectClick = (project) => {
    selectProject(project);
    // Navigate to the new URL structure with userId and projectId
    const viewMode = params.viewMode || 'list';
    navigate(`/dashboard/${user.id}/${project.id}/${viewMode}`);
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await refreshProjects(); // Refresh project list after creating new project
  };

  return (
    <>
      <div className={`h-screen bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">Manageko.</h2>
                <p className="text-xs text-gray-500">manag@mail.com</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <i className={`pi ${isCollapsed ? 'pi-angle-right' : 'pi-angle-left'} text-gray-600 text-sm`}></i>
          </button>
        </div>

        {/* Main Menu Section */}
        <div className="flex-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</h3>
                <i className="pi pi-angle-down text-gray-400 text-xs"></i>
              </div>
            </div>
          )}

          <nav className="px-2">
            {mainMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors mb-0.5 ${
                  location.pathname === item.path
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <i className={`${item.icon} text-base`}></i>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-normal">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Projects Section */}
          {!isCollapsed && (
            <>
              <div className="px-4 py-3 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Create new project"
                    >
                      <i className="pi pi-plus text-gray-600 text-xs"></i>
                    </button>
                    <button
                      onClick={() => setShowProjectsMenu(!showProjectsMenu)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <i className={`pi ${showProjectsMenu ? 'pi-angle-down' : 'pi-angle-right'} text-gray-400 text-xs`}></i>
                    </button>
                  </div>
                </div>
              </div>

              {showProjectsMenu && (
                <nav className="px-2">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <i className="pi pi-spin pi-spinner"></i> Loading projects...
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No projects yet
                    </div>
                  ) : (
                    projects.map((project, index) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectClick(project)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors mb-0.5 ${
                          activeProject?.id === project.id
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-7 h-7 ${getProjectColor(index)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-semibold text-xs">{getProjectInitials(project.name)}</span>
                        </div>
                        <span className="flex-1 text-left text-sm font-normal truncate">{project.name}</span>
                      </button>
                    ))
                  )}

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors mt-1"
                  >
                    <i className="pi pi-plus text-base"></i>
                    <span className="flex-1 text-left text-sm font-normal">Create New Project</span>
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        visible={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggle: PropTypes.func.isRequired
};

Sidebar.defaultProps = {
  isCollapsed: false
};

export default Sidebar;
