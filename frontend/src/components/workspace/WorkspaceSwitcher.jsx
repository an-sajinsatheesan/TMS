import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const WorkspaceSwitcher = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const { workspaces, currentWorkspace, switchWorkspace, loading } = useWorkspace();
  const [open, setOpen] = useState(false);

  const handleWorkspaceSelect = (workspace) => {
    switchWorkspace(workspace);
    setOpen(false);
  };

  const handleSettingsClick = () => {
    setOpen(false);
    navigate('/workspace/settings');
  };

  const handleCreateWorkspace = () => {
    setOpen(false);
    navigate('/workspace/create');
  };

  if (loading) {
    return (
      <div className={cn("px-2 py-2", isCollapsed && "flex justify-center")}>
        <div className="h-10 w-10 rounded bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto py-2 hover:bg-gray-100",
            isCollapsed ? "px-0 justify-center" : "px-2"
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <Building2 className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {currentWorkspace.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentWorkspace.userRole === 'TENANT_ADMIN' ? 'Admin' : 'Member'}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          {/* Current Workspace Info */}
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
            Workspaces
          </div>

          {/* Workspace List */}
          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((workspace) => {
              const isSelected = currentWorkspace?.id === workspace.id;
              return (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-left',
                    isSelected && 'bg-blue-50'
                  )}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {workspace.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {workspace.userRole === 'TENANT_ADMIN' ? 'Admin' : 'Member'}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t my-1" />

          {/* Actions */}
          <button
            onClick={handleSettingsClick}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-left text-sm"
          >
            <Settings className="h-4 w-4 text-gray-600" />
            <span>Workspace Settings</span>
          </button>

          <button
            onClick={handleCreateWorkspace}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-left text-sm"
          >
            <Plus className="h-4 w-4 text-gray-600" />
            <span>Create Workspace</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WorkspaceSwitcher;
