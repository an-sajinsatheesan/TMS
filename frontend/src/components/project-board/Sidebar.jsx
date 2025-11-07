import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  CheckSquare,
  Star,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Play,
  History,
  Settings,
  Cpu,
  FileText,
  Briefcase,
  Code,
  MoreHorizontal,
  ShoppingCart,
  Plane,
  LifeBuoy,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
    { icon: CheckSquare, label: "Today's Tasks", path: '/today' },
  ];

  const favoritedProjects = [
    { id: 1, name: 'Design System', color: 'bg-blue-500' },
    { id: 2, name: 'Marketing Campaign', color: 'bg-purple-500' },
    { id: 3, name: 'Mobile App', color: 'bg-green-500' },
  ];

  const allProjects = [
    { id: 4, name: 'Website Redesign', color: 'bg-orange-500' },
    { id: 5, name: 'API Development', color: 'bg-cyan-500' },
    { id: 6, name: 'Customer Portal', color: 'bg-pink-500' },
    { id: 7, name: 'Analytics Dashboard', color: 'bg-yellow-500' },
  ];

  const isActive = (path) => location.pathname === path;

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
        {/* Main Section */}
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
            {favoritedProjects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors relative group"
                onMouseEnter={() => setHoveredItem(project.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={cn('h-2 w-2 rounded-full flex-shrink-0', project.color)} />
                {!isCollapsed && <span className="truncate">{project.name}</span>}
                {isCollapsed && hoveredItem === project.name && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                    {project.name}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Projects Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 px-3 mb-2">
            <FolderKanban className="h-4 w-4 text-gray-500" />
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Projects
              </h3>
            )}
          </div>
          <nav className="space-y-1">
            {allProjects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors relative group"
                onMouseEnter={() => setHoveredItem(project.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={cn('h-2 w-2 rounded-full flex-shrink-0', project.color)} />
                {!isCollapsed && <span className="truncate">{project.name}</span>}
                {isCollapsed && hoveredItem === project.name && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                    {project.name}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User Footer */}
      <div className="border-t p-2">
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
              <Play className="mr-2 h-4 w-4" />
              Platform Playground
            </DropdownMenuItem>
            <DropdownMenuItem>
              <History className="mr-2 h-4 w-4" />
              Toggle History
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              Starred
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Cpu className="mr-2 h-4 w-4" />
              Models
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Toggle Documentation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Toggle Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Projects</DropdownMenuLabel>
            <DropdownMenuItem>
              <Briefcase className="mr-2 h-4 w-4" />
              Design
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Code className="mr-2 h-4 w-4" />
              Engineering
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MoreHorizontal className="mr-2 h-4 w-4" />
                More
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Sales & Marketing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plane className="mr-2 h-4 w-4" />
                  Travel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedback
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
