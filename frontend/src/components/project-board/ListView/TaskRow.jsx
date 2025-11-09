import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Flag, ChevronRight, CheckCircle2, Circle, ListTree } from 'lucide-react';
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

const TaskRow = ({ task, columns, onToggleComplete, onAssigneeChange, onDateChange, onSelectChange, onTaskNameSave, onDuplicate, onOpenDetails, onCreateSubtask, onDelete, onToggleExpand, isSubtask = false, isExpanded = false, hasSubtasks = false, level = 0, columnWidths }) => {
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
    // Milestone icon
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

    // Subtask uses smaller circle
    if (isSubtask) {
      return task.completed ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-gray-400" />
      );
    }

    // Regular task
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
        'group hover:bg-gray-50 transition-colors border-b border-gray-200 min-h-[32px]',
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
        <div className="flex w-max min-w-full border-b">
          {/* Drag Handle Column - Sticky Left */}
          <div
            className={cn(
              columnWidths.checkbox,
              'sticky left-0 z-20 flex-shrink-0 border-r p-1 bg-white cursor-grab active:cursor-grabbing'
            )}
            {...attributes}
            {...listeners}
          >
            <div className="flex  items-center justify-center w-full h-full text-gray-400 hover:text-gray-600">
              <GripVertical className="h-3 w-3" />
            </div>
          </div>

          {/* Task Name Column - Sticky Left */}
          <div
            className={cn(
              columnWidths.taskName,
              'sticky z-20 left-8 flex-shrink-0 border-r px-2 py-1 bg-white flex items-center gap-1'
            )}
          >
            {/* Indentation for nested tasks */}
            {level > 0 && <div className="flex-shrink-0" style={{ width: `${level * 20}px` }} />}

            {/* Expand/Collapse Chevron */}
            {hasSubtasks ? (
              <button
                onClick={() => onToggleExpand(task.id)}
                className="flex items-center justify-center flex-shrink-0 hover:bg-gray-100 rounded p-0.5"
              >
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-gray-500 transition-transform',
                    isExpanded && 'transform rotate-90'
                  )}
                />
              </button>
            ) : (
              <div className="w-5 flex-shrink-0" />
            )}

            {/* Completion Circle */}
            <button
              onClick={() => onToggleComplete(task.id)}
              className="flex items-center justify-center flex-shrink-0"
            >
              {getTaskIcon()}
            </button>

            {/* Task Title */}
            <div className="flex-1 min-w-0">
              <EditableTaskName
                taskId={task.id}
                value={task.name}
                onSave={onTaskNameSave}
                isCompleted={task.completed}
              />
            </div>

            {/* Subtask count badge */}
            {hasSubtasks && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0 flex items-center gap-1">
                <ListTree className="h-3 w-3" />
                {task.subtasks?.length || 0}
              </Badge>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 flex">
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

              return (
                <div
                  key={column.id}
                  className={cn(widthClass, 'border-r flex items-center justify-center text-xs text-gray-700')}
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
                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs px-0"
                    />
                  )}

                  {column.type === 'number' && (
                    <input
                      type="number"
                      value={value || ''}
                      onChange={(e) => onSelectChange(task.id, column.id, e.target.value ? Number(e.target.value) : null)}
                      placeholder="-"
                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs px-0"
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
                  {!value && !['checkbox', 'text', 'number', 'select', 'multiselect', 'user', 'date'].includes(column.type) && (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fixed Right Column */}
          <div className={cn(
            columnWidths.addColumn,
            'sticky right-0 flex-shrink-0 border-l bg-white text-center p-1'
          )}>
            <span className="text-gray-400 text-xs">⋯</span>
          </div>
        </div>
      </TaskContextMenu>
    </div>
  );
};

export default TaskRow;
