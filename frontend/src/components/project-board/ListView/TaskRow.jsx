import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Flag, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import AssigneeSelect from './AssigneeSelect';
import DatePicker from './DatePicker';
import SelectField from './SelectField';
import EditableTaskName from './EditableTaskName';
import TaskContextMenu from './TaskContextMenu';

const FIXED_COLUMNS = {
  drag: 40,
  taskName: 320,
};

const TaskRow = ({
  task,
  columns,
  onToggleComplete,
  onAssigneeChange,
  onDateChange,
  onSelectChange,
  onTaskNameSave,
  onDuplicate,
  onOpenDetails,
  onCreateSubtask,
  onDelete,
  isSubtask = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: isSubtask,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTaskIcon = () => {
    if (task.type === 'milestone') {
      return <Flag className={cn('h-4 w-4', task.completed ? 'text-emerald-500 fill-emerald-500' : 'text-gray-600')} />;
    }
    return task.completed ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500" />
    ) : (
      <Circle className="h-4 w-4 text-gray-400" />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors min-h-[44px]',
        isDragging && 'opacity-50 shadow-xl ring-2 ring-blue-400'
      )}
    >
      {/* Drag Icon - Sticky Left */}
      <div
        className={cn(
          'sticky left-0 z-20 bg-white group-hover:bg-gray-50 flex items-center justify-center border-r border-gray-200',
          !isSubtask && 'cursor-grab active:cursor-grabbing'
        )}
        style={{ width: FIXED_COLUMNS.drag }}
      >
        {!isSubtask && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Task Name - Sticky Left */}
      <div
        className="sticky z-20 bg-white group-hover:bg-gray-50 px-3 py-2 flex items-center gap-2 border-r border-gray-200"
        style={{ left: FIXED_COLUMNS.drag, width: FIXED_COLUMNS.taskName }}
      >
        <TaskContextMenu
          task={task}
          onDuplicate={onDuplicate}
          onMarkComplete={onToggleComplete}
          onOpenDetails={onOpenDetails}
          onCreateSubtask={onCreateSubtask}
          onDelete={onDelete}
        >
          <div className="flex items-center gap-2 w-full min-w-0">
            {/* Completion checkbox */}
            <button onClick={() => onToggleComplete(task.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
              {getTaskIcon()}
            </button>

            {/* Task Name - Editable */}
            <div className="flex-1 min-w-0">
              <EditableTaskName taskId={task.id} value={task.name || task.title} onSave={onTaskNameSave} isCompleted={task.completed} />
            </div>

            {/* Subtask count badge */}
            {task.subtaskCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0">
                {task.subtaskCount}
              </Badge>
            )}
          </div>
        </TaskContextMenu>
      </div>

      {/* Scrollable Columns */}
      <div className="flex">
        {columns.map((column) => {
          let value = task[column.id] || task.customFields?.[column.id];

          if (column.name === 'Assignee') value = task.assigneeId || task.assigneeName;
          if (column.name === 'Status') value = task.status;
          if (column.name === 'Priority') value = task.priority;
          if (column.name === 'Due Date') value = task.dueDate;

          return (
            <div key={column.id} className="px-3 py-2 border-r border-gray-200 flex items-center" style={{ width: column.width || 200 }}>
              {column.type === 'user' && (
                <AssigneeSelect
                  taskId={task.id}
                  currentAssigneeId={task.assigneeId}
                  currentAssigneeName={task.assigneeName}
                  currentAssigneeAvatar={task.assigneeAvatar}
                  onAssigneeChange={onAssigneeChange}
                />
              )}

              {column.type === 'date' && (
                <DatePicker taskId={task.id} currentDate={value} onDateChange={onDateChange} />
              )}

              {column.type === 'select' && (
                <SelectField taskId={task.id} column={column} currentValue={value} onValueChange={onSelectChange} />
              )}

              {column.type === 'text' && value && <span className="text-sm truncate">{value}</span>}

              {column.type === 'number' && value !== null && value !== undefined && (
                <span className="text-sm">{value}</span>
              )}

              {!value && column.type !== 'checkbox' && column.type !== 'user' && column.type !== 'date' && column.type !== 'select' && (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskRow;
