import { cn } from '@/lib/utils';

const DropIndicator = ({ columnWidths, scrollableColumnsCount = 3 }) => {
  return (
    <div className="relative h-8 w-full animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex w-max min-w-full h-full">
        {/* Drag Handle Column - Sticky Left */}
        <div
          className={cn(
            columnWidths.checkbox,
            'sticky left-0 z-20 flex-shrink-0 border-r bg-gray-100'
          )}
        />

        {/* Task Name Column - Sticky Left */}
        <div
          className={cn(
            columnWidths.taskName,
            'sticky z-20 left-8 flex-shrink-0 border-r bg-gray-100'
          )}
        />

        {/* Scrollable columns */}
        <div className="flex-1 flex bg-gray-100">
          {Array.from({ length: scrollableColumnsCount }).map((_, idx) => (
            <div
              key={idx}
              className="w-32 border-r"
            />
          ))}
        </div>

        {/* Fixed Right Column */}
        <div className={cn(
          columnWidths.addColumn,
          'sticky right-0 flex-shrink-0 border-l bg-gray-100'
        )} />
      </div>

      {/* Dashed border indicator */}
      <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/50 pointer-events-none" />
    </div>
  );
};

export default DropIndicator;
