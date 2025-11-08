import PropTypes from 'prop-types';
import { Copy, CheckCircle, ExternalLink, Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { toast } from 'sonner';

const TaskContextMenu = ({ children, task, onDuplicate, onMarkComplete, onOpenDetails, onCreateSubtask, onDelete }) => {
  const handleCopyLink = () => {
    const taskUrl = `${window.location.origin}/projects/${task.projectId}/tasks/${task.id}`;
    navigator.clipboard.writeText(taskUrl).then(() => {
      toast.success('Task link copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const handleDuplicate = () => {
    onDuplicate?.(task.id);
  };

  const handleMarkComplete = () => {
    onMarkComplete?.(task.id);
  };

  const handleOpenDetails = () => {
    onOpenDetails?.(task.id);
  };

  const handleCreateSubtask = () => {
    onCreateSubtask?.(task.id);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
      onDelete?.(task.id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate Task</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={handleMarkComplete}>
          <CheckCircle className="mr-2 h-4 w-4" />
          <span>{task.completed ? 'Mark as Incomplete' : 'Mark as Completed'}</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleOpenDetails}>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>Open Task Details</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={handleCreateSubtask}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Sub Task</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleCopyLink}>
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>Copy Task Link</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Task</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

TaskContextMenu.propTypes = {
  children: PropTypes.node.isRequired,
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    completed: PropTypes.bool,
    projectId: PropTypes.string,
  }).isRequired,
  onDuplicate: PropTypes.func,
  onMarkComplete: PropTypes.func,
  onOpenDetails: PropTypes.func,
  onCreateSubtask: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TaskContextMenu;
