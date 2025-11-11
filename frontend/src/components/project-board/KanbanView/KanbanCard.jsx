import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Circle, CheckCircle2, Calendar, User, ListTree, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const KanbanCard = ({ task, onClick, onUpdateTaskName }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [taskName, setTaskName] = useState(task.title || task.name);

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

  const handleNameSave = async () => {
    if (!taskName.trim() || taskName === (task.title || task.name)) {
      setTaskName(task.title || task.name);
      setIsEditingName(false);
      return;
    }

    try {
      await onUpdateTaskName(task.id, taskName.trim());
      setIsEditingName(false);
    } catch (error) {
      setTaskName(task.title || task.name);
      setIsEditingName(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 mb-2 shadow-sm hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-blue-400'
      )}
    >
      {/* Row 1: Complete Icon & Task Name */}
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="flex-shrink-0 mt-0.5"
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {isEditingName ? (
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSave();
              if (e.key === 'Escape') {
                setTaskName(task.title || task.name);
                setIsEditingName(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm font-medium text-gray-900 border-b border-blue-500 focus:outline-none bg-transparent px-1"
            autoFocus
          />
        ) : (
          <div
            className="flex-1 min-w-0 group/name cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
            }}
          >
            <div className="flex items-center gap-1">
              <h4 className={cn(
                "text-sm font-medium text-gray-900 line-clamp-2 flex-1",
                task.completed && "line-through text-gray-500"
              )}>
                {task.title || task.name}
              </h4>
              <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover/name:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Column Field Values (except assignee & due date) */}
      <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
        {/* Priority */}
        {task.priority && (
          <Badge variant="outline" className={cn(
            'text-xs px-1.5 py-0',
            task.priority.toLowerCase() === 'high' && 'bg-red-100 text-red-700 border-red-200',
            task.priority.toLowerCase() === 'medium' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
            task.priority.toLowerCase() === 'low' && 'bg-blue-100 text-blue-700 border-blue-200'
          )}>
            {task.priority}
          </Badge>
        )}

        {/* Status */}
        {task.status && (
          <Badge variant="outline" className={cn(
            'text-xs px-1.5 py-0',
            task.status.toLowerCase() === 'on track' && 'bg-green-100 text-green-700 border-green-200',
            task.status.toLowerCase() === 'at risk' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
            task.status.toLowerCase() === 'off track' && 'bg-red-100 text-red-700 border-red-200',
            task.status.toLowerCase() === 'completed' && 'bg-purple-100 text-purple-700 border-purple-200',
            task.status.toLowerCase() === 'on hold' && 'bg-gray-100 text-gray-700 border-gray-200'
          )}>
            {task.status}
          </Badge>
        )}
      </div>

      {/* Row 3: Assignee, Due Date, Subtask Count */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-2">
          {/* Assignee */}
          {task.assigneeId ? (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assigneeAvatar} />
                <AvatarFallback className="text-xs">
                  {task.assigneeName?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <User className="h-3 w-3" />
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}
        </div>

        {/* Subtask count */}
        {task.subtaskCount > 0 && (
          <div className="flex items-center gap-1 text-gray-500">
            <ListTree className="h-3 w-3" />
            <span>{task.subtaskCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
