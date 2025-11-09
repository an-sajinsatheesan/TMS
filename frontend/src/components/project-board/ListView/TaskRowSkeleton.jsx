import { cn } from '@/lib/utils';

const TaskRowSkeleton = ({ columnWidths, scrollableColumnsCount = 3 }) => {
  return (
    <div className="group hover:bg-gray-50 transition-colors border-b border-gray-200 min-h-[32px] animate-pulse">
      <div className="flex w-max min-w-full border-b">
        {/* Drag Handle Column - Sticky Left */}
        <div
          className={cn(
            columnWidths.checkbox,
            'sticky left-0 z-20 flex-shrink-0 border-r p-1 bg-white'
          )}
        >
          <div className="w-3 h-3 bg-gray-200 rounded mx-auto" />
        </div>

        {/* Task Name Column - Sticky Left */}
        <div
          className={cn(
            columnWidths.taskName,
            'sticky z-20 left-8 flex-shrink-0 border-r px-2 py-1 bg-white flex items-center gap-2'
          )}
        >
          <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 h-4 bg-gray-200 rounded w-3/4" />
        </div>

        {/* Scrollable columns skeleton */}
        <div className="flex-1 flex">
          {Array.from({ length: scrollableColumnsCount }).map((_, idx) => (
            <div
              key={idx}
              className="w-32 border-r flex items-center justify-center p-2"
            >
              <div className="w-16 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Fixed Right Column */}
        <div className={cn(
          columnWidths.addColumn,
          'sticky right-0 flex-shrink-0 border-l bg-white'
        )} />
      </div>
    </div>
  );
};

export default TaskRowSkeleton;
