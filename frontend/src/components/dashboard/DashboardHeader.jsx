import { Trash2, UserPlus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const DashboardHeader = ({ project, onStatusChange, onDelete, onInvite, onSettings }) => {
  // Mock data for project members
  const members = [
    { id: 1, name: 'John Doe', avatar: '', initials: 'JD' },
    { id: 2, name: 'Jane Smith', avatar: '', initials: 'JS' },
    { id: 3, name: 'Bob Wilson', avatar: '', initials: 'BW' },
    { id: 4, name: 'Alice Brown', avatar: '', initials: 'AB' },
    { id: 5, name: 'Charlie Davis', avatar: '', initials: 'CD' },
    { id: 6, name: 'Eve Martinez', avatar: '', initials: 'EM' },
    { id: 7, name: 'Frank Thomas', avatar: '', initials: 'FT' },
  ];

  const visibleMembers = members.slice(0, 4);
  const remainingCount = Math.max(0, members.length - 4);

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
                    <Avatar className="h-8 w-8 border-2 border-white ring-2 ring-gray-100 hover:z-10 transition-transform hover:scale-110">
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
};

export default DashboardHeader;
