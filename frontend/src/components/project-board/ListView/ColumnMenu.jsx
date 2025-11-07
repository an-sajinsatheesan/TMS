import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, EyeOff, Columns } from 'lucide-react';

const ColumnMenu = ({ column, onSort, onHide, onSwap }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSortAscending = () => {
    onSort?.(column.id, 'asc');
    setIsOpen(false);
  };

  const handleSortDescending = () => {
    onSort?.(column.id, 'desc');
    setIsOpen(false);
  };

  const handleHide = () => {
    onHide?.(column.id);
    setIsOpen(false);
  };

  const handleSwap = () => {
    onSwap?.(column.id);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="ml-1 inline-flex items-center justify-center rounded p-0.5 hover:bg-gray-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={handleSortAscending} className="cursor-pointer">
          <ArrowUp className="mr-2 h-4 w-4" />
          Sort Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSortDescending} className="cursor-pointer">
          <ArrowDown className="mr-2 h-4 w-4" />
          Sort Descending
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSwap} className="cursor-pointer">
          <Columns className="mr-2 h-4 w-4" />
          Swap Columns
        </DropdownMenuItem>
        {!column.fixed && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleHide} className="cursor-pointer text-red-600">
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Column
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnMenu;
