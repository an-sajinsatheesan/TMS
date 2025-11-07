import ColumnMenu from './ColumnMenu';
import { cn } from '@/lib/utils';

const ColumnHeader = ({ column, onSort, onHide, onSwap, widthClass, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-r border-gray-200',
        'text-xs font-semibold text-gray-700 uppercase tracking-wider',
        widthClass,
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
