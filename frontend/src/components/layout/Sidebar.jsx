import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Users,
  UserCog,
  BarChart3,
  FolderKanban,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { projectsService } from '../../services/api/projects.service';
import WorkspaceSwitcher from '../workspace/WorkspaceSwitcher';

const Sidebar = ({ isCollapsed, setIsCollapsed, onAddProject }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
    { icon: UserCog, label: 'Members', path: '/members' },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  ];

  const collapsibleMenuItems = [
    { icon: Star, label: 'Favorites', key: 'favorites' },
    { icon: FolderKanban, label: 'Projects', key: 'projects' },
  ];

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsService.getAll();

        // Handle nested data structure: response.data.data
        const projectsData = response.data?.data || response.data;

        if (projectsData && Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter favorite projects - ensure projects is always an array
  const favoriteProjects = Array.isArray(projects) ? projects.filter((project) => project.isFavorite) : [];
  const recentProjects = Array.isArray(projects) ? projects.slice(0, 5) : []; // Show only 5 most recent

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  const handleProjectClick = (projectId) => {
    // Navigate to project board with correct URL format
    // /project-board/:userId/:projectId/:viewMode
    navigate(`/project-board/${user?.id}/${projectId}/list`);
  };

  // Get project color class
  const getProjectColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      cyan: 'bg-cyan-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div
      className={cn(
        'relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-white shadow-md hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <FolderKanban className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg">TaskFlow</span>
          )}
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="border-b px-2 py-3">
        <WorkspaceSwitcher isCollapsed={isCollapsed} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group',
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {item.badge}
                </span>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && hoveredItem === item.label && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}

          {/* Collapsible Menu Items - Favorites and Projects */}
          {collapsibleMenuItems.map((menuItem) => {
            const isExpanded = menuItem.key === 'favorites' ? isFavoritesExpanded : isProjectsExpanded;
            const toggleExpanded = menuItem.key === 'favorites'
              ? () => setIsFavoritesExpanded(!isFavoritesExpanded)
              : () => setIsProjectsExpanded(!isProjectsExpanded);
            const projectList = menuItem.key === 'favorites' ? favoriteProjects : recentProjects;

            return (
              <div key={menuItem.key} className="mt-1">
                {/* Main Menu Item with Chevron */}
                <button
                  onClick={toggleExpanded}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group w-full',
                    'text-gray-700 hover:bg-gray-100'
                  )}
                  onMouseEnter={() => setHoveredItem(menuItem.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <menuItem.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span>{menuItem.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-gray-500 transition-transform ml-auto',
                          isExpanded ? 'transform rotate-0' : 'transform -rotate-90'
                        )}
                      />
                    </>
                  )}
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && hoveredItem === menuItem.label && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                      {menuItem.label}
                    </div>
                  )}
                </button>

                {/* Submenu - Project List */}
                {!isCollapsed && isExpanded && (
                  <div className="mt-1">
                    {loading && menuItem.key === 'projects' ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : projectList.length > 0 ? (
                      <>
                        <nav className="space-y-1 ml-4">
                          {projectList.slice(0, 5).map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectClick(project.id)}
                              className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors relative group"
                              onMouseEnter={() => setHoveredItem(project.name)}
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <div className={cn('h-2 w-2 rounded-full flex-shrink-0', getProjectColorClass(project.color))} />
                              <span className="truncate text-left">{project.name}</span>
                            </button>
                          ))}
                        </nav>
                        {/* View All Link */}
                        {menuItem.key === 'projects' && projects.length > 5 && (
                          <div className="mt-2 ml-4 px-2">
                            <Link
                              to="/projects"
                              className="text-xs text-primary hover:underline"
                            >
                              View all {projects.length} projects →
                            </Link>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="ml-4 px-3 py-2 text-xs text-gray-500">
                        No {menuItem.key} yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="border-t">
        {/* Add Project Button */}
        <div className="p-2">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-2',
              isCollapsed ? 'px-0 justify-center' : 'px-3'
            )}
            onClick={onAddProject}
            onMouseEnter={() => setHoveredItem('Add Project')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="text-sm">Add Project</span>}
            {/* Tooltip for collapsed state */}
            {isCollapsed && hoveredItem === 'Add Project' && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                Add Project
              </div>
            )}
          </Button>
        </div>

        {/* User Footer */}
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-auto py-2',
                  isCollapsed ? 'px-0 justify-center' : 'px-2'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                  <AvatarFallback>
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3 text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'm@example.com'}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
