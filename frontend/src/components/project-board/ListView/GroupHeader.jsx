import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const GroupHeader = ({ section, taskCount, isCollapsed, onToggleCollapse }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `section-${section.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group sticky top-0 z-10 flex items-center gap-2 px-3 py-3 bg-gray-100 border-b-2 border-gray-300',
        'hover:bg-gray-150 transition-colors',
        isDragging && 'shadow-lg ring-2 ring-blue-400'
      )}
    >
      {/* Drag Handle */}
      <div
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-500" />
      </div>

      {/* Collapse/Expand Icon */}
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

      {/* Color Indicator */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: section.color }}
      />

      {/* Section Title */}
      <h3 className="text-sm font-semibold text-gray-800">{section.name}</h3>

      {/* Task Count */}
      {taskCount > 0 && (
        <span className="text-xs text-gray-500 font-medium">
          ({taskCount})
        </span>
      )}

      {/* WIP Limit (if applicable) */}
      {section.kanbanWipLimit && (
        <span className="ml-auto text-xs text-gray-500 font-medium">
          Limit: {section.kanbanWipLimit}
        </span>
      )}
    </div>
  );
};

export default GroupHeader;
