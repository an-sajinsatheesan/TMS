import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Circle, CheckCircle2, Calendar, User, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const KanbanCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Priority color mapping
  const priorityColors = {
    urgent: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const priorityColor = priorityColors[task.priority?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';

  // Task type icons/badges
  const getTypeIcon = () => {
    if (task.type === 'MILESTONE') return '🎯';
    if (task.type === 'APPROVAL') return '📋';
    return null;
  };

  const typeIcon = getTypeIcon();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-blue-400'
      )}
      onClick={onClick}
    >
      {/* Drag Handle & Title */}
      <div className="flex items-start gap-2 mb-2">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-0.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {typeIcon && <span className="text-sm">{typeIcon}</span>}
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
              {task.title || task.name}
            </h4>
          </div>

          {/* Description if present */}
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
        {/* Completion Status */}
        {task.completed ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            <span>Done</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3" />
            <span>Open</span>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
          </div>
        )}

        {/* Priority */}
        {task.priority && (
          <Badge variant="outline" className={cn('text-xs px-1.5 py-0', priorityColor)}>
            <Flag className="h-2.5 w-2.5 mr-1" />
            {task.priority}
          </Badge>
        )}
      </div>

      {/* Assignee & Subtask Count */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        {/* Assignee */}
        {task.assigneeId ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={task.assigneeAvatar} />
              <AvatarFallback className="text-xs">
                {task.assigneeName?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{task.assigneeName}</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400">Unassigned</div>
        )}

        {/* Subtask count */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="text-xs text-gray-500">
            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
