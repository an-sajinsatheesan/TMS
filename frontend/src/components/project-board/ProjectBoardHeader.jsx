import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Settings, Calendar, Check, X, Pencil } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { projectsService } from '@/services/api/projects.service';
import { projectMembersService } from '@/services/api/projectMembers.service';
import InviteMembersModal from '../modals/InviteMembersModal';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-500',
  PAUSED: 'bg-yellow-500',
  COMPLETED: 'bg-blue-500',
  ARCHIVED: 'bg-gray-500',
};

const ProjectBoardHeader = ({ project, onProjectUpdate, onDelete }) => {
  const [members, setMembers] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project?.name || '');
  const [selectedDate, setSelectedDate] = useState(project?.dueDate ? new Date(project.dueDate) : null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (project?.id) {
      fetchMembers();
    }
  }, [project?.id]);

  useEffect(() => {
    setProjectName(project?.name || '');
    setSelectedDate(project?.dueDate ? new Date(project.dueDate) : null);
  }, [project]);

  const fetchMembers = async () => {
    try {
      const response = await projectMembersService.list(project.id);
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      await projectsService.updateStatus(project.id, newStatus);
      toast.success('Project status updated');
      onProjectUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update project status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNameSave = async () => {
    if (!projectName.trim() || projectName === project.name) {
      setProjectName(project.name);
      setIsEditingName(false);
      return;
    }

    try {
      setIsUpdating(true);
      await projectsService.update(project.id, { name: projectName.trim() });
      toast.success('Project name updated');
      setIsEditingName(false);
      onProjectUpdate?.();
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update project name');
      setProjectName(project.name);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNameCancel = () => {
    setProjectName(project.name);
    setIsEditingName(false);
  };

  const handleDueDateChange = async (date) => {
    setSelectedDate(date);
    try {
      setIsUpdating(true);
      await projectsService.updateDueDate(project.id, date ? date.toISOString() : null);
      toast.success(date ? 'Due date set' : 'Due date removed');
      onProjectUpdate?.();
    } catch (error) {
      console.error('Error updating due date:', error);
      toast.error('Failed to update due date');
      setSelectedDate(project?.dueDate ? new Date(project.dueDate) : null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrash = async () => {
    const confirmed = window.confirm(
      `Move "${project.name}" to trash? You can restore it within 30 days.`
    );

    if (!confirmed) return;

    try {
      setIsUpdating(true);
      await projectsService.moveToTrash(project.id);
      toast.success('Project moved to trash');
      onDelete?.();
    } catch (error) {
      console.error('Error moving to trash:', error);
      toast.error('Failed to move project to trash');
    } finally {
      setIsUpdating(false);
    }
  };

  const visibleMembers = members.slice(0, 5);
  const remainingCount = Math.max(0, members.length - 5);

  const isDueDateOverdue = selectedDate && new Date(selectedDate) < new Date() && project?.status !== 'COMPLETED';

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left Side - Project Info */}
          <div className="flex flex-col gap-1">
            {/* Editable Project Name */}
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                      if (e.key === 'Escape') handleNameCancel();
                    }}
                    className="text-xl font-semibold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1"
                    autoFocus
                    disabled={isUpdating}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleNameSave}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleNameCancel}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div
                  className="group flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsEditingName(true)}
                >
                  <h1 className="text-xl font-semibold text-gray-900">
                    {project?.name || 'Project Name'}
                  </h1>
                  <Pencil className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>

            {/* Project Created Date & Due Date */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>
                Created {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
              </span>
              <span>•</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`flex items-center gap-1 hover:text-gray-700 ${isDueDateOverdue ? 'text-red-600 font-medium' : ''}`}>
                    <Calendar className="h-3 w-3" />
                    {selectedDate ? (
                      <>
                        Due {format(selectedDate, 'MMM dd, yyyy')}
                        {isDueDateOverdue && ' (Overdue)'}
                      </>
                    ) : (
                      'Set due date'
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDueDateChange}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDueDateChange(null)}
                        className="w-full"
                      >
                        Clear Due Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Project Status Select */}
            <Select
              value={project?.status || 'ACTIVE'}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${STATUS_COLORS.ACTIVE}`} />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="PAUSED">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${STATUS_COLORS.PAUSED}`} />
                    Paused
                  </div>
                </SelectItem>
                <SelectItem value="COMPLETED">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${STATUS_COLORS.COMPLETED}`} />
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="ARCHIVED">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${STATUS_COLORS.ARCHIVED}`} />
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
                        <AvatarImage src={member.user?.avatarUrl} alt={member.user?.fullName || member.user?.email} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {(member.user?.fullName || member.user?.email || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{member.user?.fullName || member.user?.email}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
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
                    onClick={handleTrash}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Move to Trash</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Invite</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Invite Team Members</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Invite Members Modal */}
      <InviteMembersModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={project?.id}
        currentMembers={members}
        onMembersUpdated={fetchMembers}
      />
    </>
  );
};

export default ProjectBoardHeader;
