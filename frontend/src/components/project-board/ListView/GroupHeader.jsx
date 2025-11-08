import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const FIXED_COLUMNS = {
  drag: 40,
  taskName: 320,
};

const GroupHeader = ({ section, taskCount, isCollapsed, onToggleCollapse }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `section-${section.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex bg-gray-100 hover:bg-gray-150 border-b-2 border-gray-300 min-h-[40px]',
        isDragging && 'opacity-50 shadow-xl ring-2 ring-blue-500'
      )}
    >
      {/* Drag Handle - Sticky Left */}
      <div
        className="sticky left-0 z-20 bg-gray-100 group-hover:bg-gray-150 border-r border-gray-300 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ width: FIXED_COLUMNS.drag }}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* Section Info - Sticky Left */}
      <div
        className="sticky z-20 bg-gray-100 group-hover:bg-gray-150 px-3 py-2 flex items-center gap-2"
        style={{ left: FIXED_COLUMNS.drag, width: FIXED_COLUMNS.taskName }}
      >
        {/* Collapse/Expand button */}
        <button
          onClick={() => onToggleCollapse(section.id)}
          className="flex-shrink-0 hover:bg-gray-200 rounded p-1 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Color indicator */}
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: section.color || '#94a3b8' }} />

        {/* Section name */}
        <h3 className="text-sm font-semibold text-gray-800 truncate">{section.name}</h3>

        {/* Task count */}
        {taskCount > 0 && <span className="text-xs text-gray-500 font-medium">({taskCount})</span>}

        {/* WIP Limit */}
        {section.kanbanWipLimit && (
          <span className="ml-auto text-xs text-gray-500 font-medium flex-shrink-0">Limit: {section.kanbanWipLimit}</span>
        )}
      </div>

      {/* Empty space for scrollable columns alignment */}
      <div className="flex-1 bg-gray-100 group-hover:bg-gray-150" />
    </div>
  );
};

export default GroupHeader;
