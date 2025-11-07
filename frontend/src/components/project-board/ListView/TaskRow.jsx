import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Flag, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TaskRow = ({ task, columns, onToggleComplete, isSubtask = false, columnWidths }) => {
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
      return (
        <Flag
          className={cn(
            'h-4 w-4',
            task.completed ? 'text-emerald-500 fill-emerald-500' : 'text-gray-600'
          )}
        />
      );
    }
    return task.completed ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500" />
    ) : (
      <Circle className="h-4 w-4 text-gray-400" />
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on track':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'at risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off track':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        'group flex w-max min-w-full items-center border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors',
        isDragging && 'shadow-lg ring-2 ring-blue-400'
      )}
    >
      {/* Drag Icon - Sticky Left */}
      <div
        className={cn(
          columnWidths.drag,
          'sticky left-0 z-10 bg-white group-hover:bg-gray-50 flex items-center justify-center border-r border-gray-200',
          !isSubtask && 'cursor-grab active:cursor-grabbing'
        )}
      >
        {!isSubtask && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Task Number - Sticky Left */}
      <div
        className={cn(
          columnWidths.taskNumber,
          'sticky left-10 z-10 bg-white group-hover:bg-gray-50 px-2 py-1 text-xs text-gray-500'
        )}
      >
        {task.id}
      </div>

      {/* Task Name - Sticky Left with Shadow */}
      <div
        className={cn(
          columnWidths.taskName,
          'sticky left-26 z-10 bg-white group-hover:bg-gray-50 px-2 py-1 flex items-center gap-2 relative',
          'shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]'
        )}
      >
        {/* Subtask Connector */}
        {isSubtask && (
          <>
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-px bg-gray-200" />
            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300" />
          </>
        )}

        {/* Extra padding for subtasks */}
        <div className={cn('flex items-center gap-2 flex-1 min-w-0', isSubtask && 'pl-8')}>
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
            <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
              {task.subtaskCount}
            </Badge>
          )}

          {/* Right Arrow Icon - Shows on Hover */}
          <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        </div>
      </div>

      {/* Scrollable Columns */}
      {columns
        .filter((col) => col.visible && !col.isSystem)
        .map((column) => {
          // Get value from task or custom fields
          let value = task[column.id] || task.customFields?.[column.id];

          // For system fields, use specific task properties
          if (column.name === 'Assignee') value = task.assigneeId || task.assigneeName;
          if (column.name === 'Status') value = task.status;
          if (column.name === 'Priority') value = task.priority;
          if (column.name === 'Due Date') value = task.dueDate;

          return (
            <div
              key={column.id}
              className={cn(
                columnWidths[column.id] || 'w-40',
                'px-2 py-1 border-l border-gray-100 text-sm text-gray-700 truncate'
              )}
            >
              {/* Render based on column type */}
              {column.type === 'user' && task.assigneeName && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assigneeAvatar} alt={task.assigneeName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(task.assigneeName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs">{task.assigneeName}</span>
                </div>
              )}

              {column.type === 'select' && value && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{
                    backgroundColor: column.options?.find(opt => opt.value === value)?.color + '20' || 'transparent',
                    borderColor: column.options?.find(opt => opt.value === value)?.color || 'gray',
                    color: column.options?.find(opt => opt.value === value)?.color || 'inherit',
                  }}
                >
                  {column.options?.find(opt => opt.value === value)?.label || value}
                </Badge>
              )}

              {column.type === 'multiselect' && Array.isArray(value) && value.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {value.map((val, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs px-1.5 py-0"
                      style={{
                        backgroundColor: column.options?.find(opt => opt.value === val)?.color + '20' || 'transparent',
                        borderColor: column.options?.find(opt => opt.value === val)?.color || 'gray',
                        color: column.options?.find(opt => opt.value === val)?.color || 'inherit',
                      }}
                    >
                      {column.options?.find(opt => opt.value === val)?.label || val}
                    </Badge>
                  ))}
                </div>
              )}

              {column.type === 'date' && value && (
                <span className="text-xs">{formatDate(value)}</span>
              )}

              {column.type === 'text' && value && (
                <span className="text-xs">{value}</span>
              )}

              {column.type === 'number' && value !== null && value !== undefined && (
                <span className="text-xs">{value}</span>
              )}

              {column.type === 'checkbox' && (
                <input
                  type="checkbox"
                  checked={!!value}
                  readOnly
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              )}

              {/* Show empty state if no value */}
              {!value && column.type !== 'checkbox' && (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default TaskRow;
