import { GripVertical } from 'lucide-react';
import ColumnMenu from './ColumnMenu';
import { cn } from '@/lib/utils';

const ColumnHeader = ({ column, widthClass, onSort, onHide, onSwap, className, isLastFixed = false }) => {
  return (
    <div
      className={cn(
        widthClass,
        'flex-shrink-0 flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-r border-gray-200',
        'text-xs font-semibold text-gray-700 uppercase tracking-wider',
        column.fixed && 'sticky z-20 bg-gray-50',
        column.id === 'taskNumber' && 'left-[40px]',
        column.id === 'taskName' && 'left-[104px]',
        isLastFixed && 'shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.1)]',
        className
      )}
    >
      <div className="flex items-center gap-1 min-w-0">
        <span className="truncate">{column.label}</span>
        {(column.id === 'taskNumber' || column.id === 'taskName') && (
          <ColumnMenu
            column={column}
            onSort={onSort}
            onHide={onHide}
            onSwap={onSwap}
          />
        )}
      </div>
    </div>
  );
};

export default ColumnHeader;
