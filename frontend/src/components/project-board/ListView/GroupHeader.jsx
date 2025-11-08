import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const GroupHeader = ({ section, taskCount, isCollapsed, onToggleCollapse, columnWidths, scrollableColumnCount = 0 }) => {
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
      style={{ ...style, top: '37px' }}
      className={cn(
        'group sticky z-30 bg-gray-50 border-b border-gray-200',
        'transition-all duration-200',
        isDragging && 'opacity-50 scale-[1.02]'
      )}
    >
      <div className="flex min-w-max">
        {/* Drag Handle - Sticky Left */}
        <div
          className={cn(
            columnWidths.drag,
            'sticky z-40 bg-gray-50 border-r border-gray-200 flex items-center justify-center cursor-grab active:cursor-grabbing'
          )}
          style={{ left: 0 }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Group Title - Sticky Left */}
        <div
          className={cn(
            columnWidths.taskName,
            'sticky z-40 bg-gray-50 border-r border-gray-200 px-2 py-2 flex items-center gap-2'
          )}
          style={{ left: '40px' }}
        >
          {/* Collapse/Expand Button */}
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
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: section.color || '#6B7280' }}
          />

          {/* Section Title */}
          <h3 className="text-sm font-semibold text-gray-900">{section.name}</h3>

          {/* Task Count */}
          {taskCount > 0 && (
            <span className="text-xs text-gray-500 font-medium">
              ({taskCount})
            </span>
          )}

          {/* WIP Limit */}
          {section.kanbanWipLimit && (
            <span className="ml-auto text-xs text-gray-500 font-medium">
              Limit: {section.kanbanWipLimit}
            </span>
          )}
        </div>

        {/* Scrollable empty space - fills the rest */}
        <div className="flex-1 bg-gray-50 border-r border-gray-200" />

        {/* Actions Column - Sticky Right */}
        <div
          className={cn(
            columnWidths.addColumn,
            'sticky z-40 bg-gray-50 border-l border-gray-200'
          )}
          style={{ right: 0 }}
        />
      </div>
    </div>
  );
};

export default GroupHeader;
