import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import ColumnMenu from './ColumnMenu';
import { cn } from '@/lib/utils';

const ColumnHeader = ({ column, onSort, onHide, sortConfig }) => {
  const NON_SORTABLE_COLUMNS = ['taskName', 'taskNumber'];
  const isSortable = !NON_SORTABLE_COLUMNS.includes(column.id);

  const isActive = sortConfig?.column === column.id;
  const currentDirection = isActive ? sortConfig.direction : null;

  const handleSort = () => {
    if (!isSortable) return;
    const newDirection = currentDirection === 'asc' ? 'desc' : currentDirection === 'desc' ? null : 'asc';
    onSort(column.id, newDirection);
  };

  const getSortIcon = () => {
    if (!isSortable) return null;
    if (currentDirection === 'asc') return <ArrowUp className="w-3 h-3" />;
    if (currentDirection === 'desc') return <ArrowDown className="w-3 h-3" />;
    return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />;
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 bg-gray-100 text-xs font-semibold text-gray-700 tracking-wide group h-full">
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {isSortable ? (
          <button onClick={handleSort} className="flex items-center gap-1 hover:text-gray-900 transition-colors min-w-0 flex-1">
            <span className="truncate">{column.label || column.name}</span>
            {getSortIcon()}
          </button>
        ) : (
          <span className="truncate">{column.label || column.name}</span>
        )}
      </div>
      {onHide && !column.isSystem && (
        <ColumnMenu column={column} onSort={onSort} onHide={onHide} />
      )}
    </div>
  );
};

export default ColumnHeader;
