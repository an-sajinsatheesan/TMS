import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KanbanColumn = ({
  section,
  tasks,
  onTaskClick,
  onAddTask,
  onUpdateTaskName
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: section.id,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex flex-col h-full min-w-[320px] max-w-[320px]">
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-3 rounded-t-lg border-b-2"
        style={{
          borderColor: section.color || '#94a3b8',
          backgroundColor: `${section.color || '#94a3b8'}10`
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: section.color || '#94a3b8' }}
          />
          <h3 className="font-semibold text-sm text-gray-900">
            {section.name}
          </h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => onAddTask(section.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 bg-gray-50 rounded-b-lg overflow-y-auto min-h-0',
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
                onUpdateTaskName={onUpdateTaskName}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
