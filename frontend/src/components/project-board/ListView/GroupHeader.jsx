import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const GroupHeader = ({ section, taskCount, isCollapsed, onToggleCollapse, columnWidths }) => {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group sticky top-0 z-30 flex w-max min-w-full items-center gap-2 border-b-2',
        'transition-all duration-200',
        isDragging
          ? 'bg-white border-2 border-dashed border-blue-500 shadow-2xl opacity-90 scale-[1.02]'
          : 'bg-gray-100 border-gray-300 hover:bg-gray-150'
      )}
    >
      {/* Drag Handle - Sticky Left */}
      <div
        className={cn(
          columnWidths.drag,
          'sticky left-0 z-20 flex items-center justify-center border-r transition-colors',
          'cursor-grab active:cursor-grabbing',
          isDragging
            ? 'bg-white border-blue-500'
            : 'bg-gray-100 group-hover:bg-gray-150 border-gray-300'
        )}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* Collapse/Expand + Group Info - Spans across sticky columns */}
      <div className={cn(
        'sticky left-10 z-20 flex items-center gap-2 px-2 py-1.5 transition-colors',
        isDragging ? 'bg-white' : 'bg-gray-100 group-hover:bg-gray-150'
      )}>
        {/* Collapse/Expand Icon */}
        <button
          onClick={() => onToggleCollapse(section.id)}
          className="flex-shrink-0 hover:bg-gray-200 rounded p-0.5 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Color Indicator */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
    </div>
  );
};

export default GroupHeader;
