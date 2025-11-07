import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Users,
  BarChart3,
  FolderKanban,
  Star,
  ChevronLeft,
  ChevronRight,
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

const Sidebar = ({ isCollapsed, setIsCollapsed, onAddProject }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
  ];

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsService.getAll();
        if (response.data) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter favorite projects
  const favoriteProjects = projects.filter((project) => project.isFavorite);
  const recentProjects = projects.slice(0, 5); // Show only 5 most recent

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
        </nav>

        {/* Favorites Section */}
        {favoriteProjects.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Star className="h-4 w-4 text-gray-500" />
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Favorites
                </h3>
              )}
            </div>
            <nav className="space-y-1">
              {favoriteProjects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors relative group"
                  onMouseEnter={() => setHoveredItem(project.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className={cn('h-2 w-2 rounded-full flex-shrink-0', getProjectColorClass(project.color))} />
                  {!isCollapsed && <span className="truncate text-left">{project.name}</span>}
                  {isCollapsed && hoveredItem === project.name && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                      {project.name}
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Recent Projects Section */}
        {recentProjects.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 px-3 mb-2">
              <FolderKanban className="h-4 w-4 text-gray-500" />
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recent Projects
                </h3>
              )}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <nav className="space-y-1">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors relative group"
                    onMouseEnter={() => setHoveredItem(project.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className={cn('h-2 w-2 rounded-full flex-shrink-0', getProjectColorClass(project.color))} />
                    {!isCollapsed && <span className="truncate text-left">{project.name}</span>}
                    {isCollapsed && hoveredItem === project.name && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                        {project.name}
                      </div>
                    )}
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* View All Projects Link */}
        {!isCollapsed && projects.length > 5 && (
          <div className="mt-2 px-3">
            <Link
              to="/projects"
              className="text-xs text-primary hover:underline"
            >
              View all {projects.length} projects →
            </Link>
          </div>
        )}
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
