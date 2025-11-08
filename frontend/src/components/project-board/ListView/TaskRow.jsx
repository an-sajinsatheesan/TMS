import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Flag, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import AssigneeSelect from './AssigneeSelect';
import DatePicker from './DatePicker';
import SelectField from './SelectField';
import EditableTaskName from './EditableTaskName';
import TaskContextMenu from './TaskContextMenu';

// Column width mapping
const getColumnWidthClass = (width) => {
  if (width <= 64) return 'w-16';
  if (width <= 100) return 'w-24';
  if (width <= 150) return 'w-32';
  if (width <= 200) return 'w-48';
  if (width <= 300) return 'w-64';
  return 'w-80';
};

const TaskRow = ({ task, columns, onToggleComplete, onAssigneeChange, onDateChange, onSelectChange, onTaskNameSave, onDuplicate, onOpenDetails, onCreateSubtask, onDelete, isSubtask = false, columnWidths }) => {
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
        'group hover:bg-gray-50 transition-colors border-b border-gray-200 min-h-[36px]',
        isDragging && 'opacity-50'
      )}
    >
      <TaskContextMenu
        task={task}
        onDuplicate={onDuplicate}
        onMarkComplete={onToggleComplete}
        onOpenDetails={onOpenDetails}
        onCreateSubtask={onCreateSubtask}
        onDelete={onDelete}
      >
        <div className="flex min-w-max">
          {/* Drag Handle Column - Sticky Left */}
          <div
            className={cn(
              columnWidths.drag,
              'sticky z-20 bg-white group-hover:bg-gray-50 border-r border-gray-200 flex items-center justify-center',
              !isSubtask && 'cursor-grab active:cursor-grabbing'
            )}
            style={{ left: 0 }}
          >
            {!isSubtask && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity" {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Task Name Column - Sticky Left - 3 Parts: Status Icon | Task Title | Arrow */}
          <div
            className={cn(
              columnWidths.taskName,
              'sticky bg-white group-hover:bg-gray-50 border-r border-gray-200 px-2 py-1 flex items-center gap-2'
            )}
            style={{ left: '40px', zIndex: 20 }}
          >
            {/* Subtask Connector Lines */}
            {isSubtask && (
              <>
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-300" />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-300" />
              </>
            )}

            {/* Left padding for subtasks only */}
            {isSubtask && <div className="w-6 flex-shrink-0" />}

            {/* Left: Status Icon (Colored dot or checkmark) */}
            <button
              onClick={() => onToggleComplete(task.id)}
              className="flex-shrink-0 hover:scale-110 transition-transform"
            >
              {getTaskIcon()}
            </button>

            {/* Center: Task Title Text */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              {/* Subtask indicator icon */}
              {isSubtask && (
                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}

              <EditableTaskName
                taskId={task.id}
                value={task.name}
                onSave={onTaskNameSave}
                isCompleted={task.completed}
              />

              {/* Subtask count badge */}
              {task.subtaskCount > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0">
                  {task.subtaskCount}
                </Badge>
              )}
            </div>

            {/* Right: Arrow Icon (Chevron for expanding) */}
            <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          {/* Dynamic/Scrollable Columns */}
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

              const widthClass = getColumnWidthClass(column.width);

              // Select fields need to fill entire cell for Monday.com style
              const isSelectField = column.type === 'select';

              return (
                <div
                  key={column.id}
                  className={cn(
                    widthClass,
                    'border-r border-gray-200 flex items-center text-sm text-gray-700',
                    !isSelectField && 'px-2 py-1'
                  )}
                >
                  {/* Render based on column type */}
                  {column.type === 'user' && (
                    <AssigneeSelect
                      taskId={task.id}
                      currentAssigneeId={task.assigneeId}
                      currentAssigneeName={task.assigneeName}
                      currentAssigneeAvatar={task.assigneeAvatar}
                      onAssigneeChange={onAssigneeChange}
                    />
                  )}

                  {column.type === 'select' && (
                    <SelectField
                      taskId={task.id}
                      column={column}
                      currentValue={value}
                      onValueChange={onSelectChange}
                    />
                  )}

                  {column.type === 'multiselect' && (
                    <>
                      {Array.isArray(value) && value.length > 0 ? (
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
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </>
                  )}

                  {column.type === 'date' && (
                    <DatePicker
                      taskId={task.id}
                      currentDate={value}
                      onDateChange={onDateChange}
                    />
                  )}

                  {column.type === 'text' && (
                    <input
                      type="text"
                      value={value || ''}
                      onChange={(e) => onSelectChange(task.id, column.id, e.target.value)}
                      placeholder="-"
                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm"
                    />
                  )}

                  {column.type === 'number' && (
                    <input
                      type="number"
                      value={value || ''}
                      onChange={(e) => onSelectChange(task.id, column.id, e.target.value ? Number(e.target.value) : null)}
                      placeholder="-"
                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm"
                    />
                  )}

                  {column.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => onSelectChange(task.id, column.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {/* Show empty state if no value and not an input type */}
                  {!value && !['checkbox', 'text', 'number', 'select', 'multiselect', 'user'].includes(column.type) && (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              );
            })}

          {/* Actions Column - Sticky Right */}
          <div
            className={cn(
              columnWidths.addColumn,
              'sticky z-20 bg-white group-hover:bg-gray-50 border-l border-gray-200 flex items-center justify-center'
            )}
            style={{ right: 0 }}
          >
            <span className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">⋯</span>
          </div>
        </div>
      </TaskContextMenu>
    </div>
  );
};

export default TaskRow;
