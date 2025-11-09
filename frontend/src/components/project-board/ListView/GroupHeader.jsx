import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// Column width mapping
const getColumnWidthClass = (width) => {
  if (width <= 64) return 'w-16';
  if (width <= 100) return 'w-24';
  if (width <= 150) return 'w-32';
  if (width <= 200) return 'w-48';
  if (width <= 300) return 'w-64';
  return 'w-80';
};

const GroupHeader = ({ section, taskCount, isCollapsed, onToggleCollapse, columnWidths, scrollableColumns = [] }) => {
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
    <div className="w-max min-w-full">
      {/* Sticky Group Header */}
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "sticky top-[26px] z-30 flex bg-gray-200 border-b border-gray-300 w-max min-w-full transition-all duration-200",
          isDragging && 'opacity-0 h-0 min-h-0 overflow-hidden'
        )}
      >
        {/* Left sticky column - empty for checkbox alignment */}
        <div className={cn(
          columnWidths.checkbox,
          'sticky left-0 flex-shrink-0 bg-gray-200'
        )}>
        </div>

        {/* Group Title - Sticky Left */}
        <div className={cn(
          columnWidths.taskName,
          'sticky left-8 flex-shrink-0 px-2 py-1 font-bold bg-gray-200 flex items-center gap-2'
        )}>
          {/* Collapse/Expand Button */}
          <button
            onClick={() => onToggleCollapse(section.id)}
            className="flex-shrink-0 hover:bg-gray-300 rounded p-0.5 transition-colors"
            {...attributes}
            {...listeners}
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
          <h3 className="text-xs font-semibold text-gray-900">{section.name}</h3>

          {/* Task Count */}
          {taskCount > 0 && (
            <span className="text-xs text-gray-500 font-medium">
              ({taskCount})
            </span>
          )}
        </div>

        {/* Scrollable alignment columns */}
        <div className="flex-1 flex">
          {scrollableColumns.map((column) => {
            const widthClass = getColumnWidthClass(column.width);
            return (
              <div
                key={column.id}
                className={cn(widthClass, 'px-2 py-1 bg-gray-200')}
              />
            );
          })}
        </div>

        {/* Fixed right header */}
        <div className={cn(
          columnWidths.addColumn,
          'sticky right-0 bg-gray-200 border-l flex-shrink-0'
        )}>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;
