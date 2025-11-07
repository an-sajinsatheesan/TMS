import { useLocation } from 'react-router-dom';
import { Bell, Search, Settings, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const AppHeader = ({ isProjectBoard, project, onStatusChange, onDelete, onInvite, onSettings }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Mock data for project members (will be replaced with actual data)
  const members = [
    { id: 1, name: 'John Doe', avatar: '', initials: 'JD' },
    { id: 2, name: 'Jane Smith', avatar: '', initials: 'JS' },
    { id: 3, name: 'Bob Wilson', avatar: '', initials: 'BW' },
    { id: 4, name: 'Alice Brown', avatar: '', initials: 'AB' },
    { id: 5, name: 'Charlie Davis', avatar: '', initials: 'CD' },
  ];

  const visibleMembers = members.slice(0, 4);
  const remainingCount = Math.max(0, members.length - 4);

  // Get page title based on route
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/projects') return 'Projects';
    if (location.pathname === '/favorites') return 'Favorites';
    if (location.pathname === '/teams') return 'Teams';
    if (location.pathname === '/analytics') return 'Analytics';
    if (location.pathname === '/notifications') return 'Notifications';
    return 'TaskFlow';
  };

  if (isProjectBoard) {
    // Project Board Header
    return (
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Side - Project Info */}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-900">
              {project?.name || 'Project Name'}
            </h1>
            <p className="text-xs text-gray-500">
              {project?.date || 'Created on Jan 15, 2024'}
            </p>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Project Status Select */}
            <Select
              value={project?.status || 'active'}
              onValueChange={onStatusChange}
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="paused">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Paused
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="archived">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    Archived
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Members Avatar Group */}
            <TooltipProvider>
              <div className="flex items-center -space-x-2">
                {visibleMembers.map((member) => (
                  <Tooltip key={member.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-white ring-2 ring-gray-100 hover:z-10 transition-transform hover:scale-110 cursor-pointer">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{member.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {remainingCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-700 ring-2 ring-gray-100 hover:z-10 transition-transform hover:scale-110 cursor-pointer">
                        +{remainingCount}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{remainingCount} more member{remainingCount > 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200" />

            {/* Action Buttons */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Project</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                    onClick={onInvite}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Invite</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Invite Team Members</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={onSettings}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Project Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>
    );
  }

  // General Header for other pages
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side - Title */}
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          <p className="text-xs text-gray-500">
            Welcome back, {user?.fullName || user?.name || 'User'}
          </p>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 w-64 pl-9"
            />
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 hidden md:block" />

          {/* Action Buttons */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
