import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KanbanColumn = ({
  status,
  tasks,
  color,
  onTaskClick,
  onAddTask
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status.value || 'backlog',
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex flex-col h-full min-w-[320px] max-w-[320px]">
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-3 rounded-t-lg border-b-2"
        style={{
          borderColor: color,
          backgroundColor: `${color}10`
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-sm text-gray-900">
            {status.label || 'Backlog'}
          </h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => onAddTask(status.value)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 bg-gray-50 rounded-b-lg overflow-y-auto',
          isOver && 'bg-blue-50 ring-2 ring-blue-300 ring-inset'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-sm">No tasks</p>
              <p className="text-xs mt-1">Drag tasks here</p>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task.id)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
