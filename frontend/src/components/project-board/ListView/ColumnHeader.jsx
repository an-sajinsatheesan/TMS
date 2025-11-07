import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import ColumnMenu from './ColumnMenu';
import { cn } from '@/lib/utils';

const ColumnHeader = ({ column, onSort, onHide, onSwap, widthClass, className, sortConfig }) => {
  const [sortDirection, setSortDirection] = useState(null);

  const handleSort = () => {
    let newDirection = 'asc';
    if (sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (sortDirection === 'desc') {
      newDirection = null;
    }

    setSortDirection(newDirection);
    onSort(column.id, newDirection);
  };

  // Get sort icon based on current sort state
  const getSortIcon = () => {
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3" />;
    } else if (sortDirection === 'desc') {
      return <ArrowDown className="w-3 h-3" />;
    }
    return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />;
  };

  const columnLabel = column.label || column.name || '';

  return (
    <div
      className={cn(
        'flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-r border-gray-200',
        'text-xs font-semibold text-gray-700 uppercase tracking-wider group',
        widthClass,
        className
      )}
    >
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <button
          onClick={handleSort}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors min-w-0 flex-1"
        >
          <span className="truncate">{columnLabel}</span>
          {getSortIcon()}
        </button>
      </div>

      <ColumnMenu
        column={column}
        onSort={onSort}
        onHide={onHide}
        onSwap={onSwap}
      />
    </div>
  );
};

export default ColumnHeader;
