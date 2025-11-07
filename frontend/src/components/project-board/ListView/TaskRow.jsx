import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Flag, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TaskRow = ({ task, columns, onToggleComplete, isSubtask = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isSubtask, // Disable dragging for subtasks
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTaskIcon = () => {
    if (task.type === 'milestone') {
      return <Flag className={cn('h-4 w-4', task.completed ? 'text-green-600' : 'text-gray-600')} />;
    }
    return task.completed ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <Circle className="h-4 w-4 text-gray-400" />
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on track':
        return 'bg-green-100 text-green-800';
      case 'at risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'off track':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors',
        isDragging && 'shadow-lg ring-2 ring-blue-400'
      )}
    >
      {/* Drag Icon */}
      {!isSubtask && (
        <div
          className="w-10 flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      {isSubtask && <div className="w-10 flex-shrink-0" />}

      {/* Task Number */}
      <div className="w-16 flex-shrink-0 px-3 py-3 text-xs text-gray-500">
        {task.id}
      </div>

      {/* Task Name */}
      <div
        className={cn(
          'flex-1 min-w-0 px-3 py-3 flex items-center gap-2',
          isSubtask && 'pl-8'
        )}
      >
        {/* Connector line for subtasks */}
        {isSubtask && (
          <div className="absolute left-14 w-4 h-px bg-gray-300" />
        )}

        {/* Task Icon */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className="flex-shrink-0 hover:scale-110 transition-transform"
        >
          {getTaskIcon()}
        </button>

        {/* Task Name Text */}
        <span
          className={cn(
            'text-sm font-medium truncate',
            task.completed && 'line-through text-gray-400'
          )}
        >
          {task.name}
        </span>

        {/* Subtask count badge */}
        {task.subtaskCount > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {task.subtaskCount}
          </Badge>
        )}

        {/* Right Arrow Icon */}
        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
      </div>

      {/* Scrollable Columns */}
      {columns
        .filter((col) => col.visible && !col.fixed)
        .map((column) => (
          <div
            key={column.id}
            className="px-3 py-3 border-l border-gray-100 text-sm text-gray-700 truncate"
            style={{ width: column.width }}
          >
            {column.id === 'assignee' && task.assigneeName && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assigneeAvatar} alt={task.assigneeName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(task.assigneeName)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{task.assigneeName}</span>
              </div>
            )}
            {column.id === 'status' && task.status && (
              <Badge variant="outline" className={cn('text-xs', getStatusColor(task.status))}>
                {task.status}
              </Badge>
            )}
            {column.id === 'dueDate' && <span>{formatDate(task.dueDate)}</span>}
            {column.id === 'priority' && task.priority && (
              <Badge variant="outline" className={cn('text-xs', getPriorityColor(task.priority))}>
                {task.priority}
              </Badge>
            )}
            {column.id === 'startDate' && <span>{formatDate(task.startDate)}</span>}
            {column.id === 'tags' && task.tags?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {task.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default TaskRow;
