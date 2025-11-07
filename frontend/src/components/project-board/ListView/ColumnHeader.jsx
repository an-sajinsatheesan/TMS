import { GripVertical } from 'lucide-react';
import ColumnMenu from './ColumnMenu';
import { cn } from '@/lib/utils';

const ColumnHeader = ({ column, onSort, onHide, onSwap, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-r border-gray-200',
        'text-xs font-semibold text-gray-700 uppercase tracking-wider',
        column.fixed && 'sticky left-0 z-20 bg-gray-50',
        className
      )}
      style={{ width: column.width }}
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
