import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Filter,
  ArrowUpDown,
  Columns3,
  CheckCircle2,
  Circle,
  User,
  Calendar,
  Clock,
  UserPlus,
  FileEdit,
  SortAsc,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ListViewToolbar = ({
  onFilterChange,
  onSortChange,
  onColumnVisibilityChange,
  columns = [],
  activeFilters = {},
  activeSort = null,
  projectMembers = [],
}) => {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);

  // Filter options
  const filterOptions = [
    {
      id: 'incomplete',
      label: 'Incomplete Tasks',
      icon: Circle,
      action: () => onFilterChange({ completed: false }),
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      icon: CheckCircle2,
      action: () => onFilterChange({ completed: true }),
    },
    {
      id: 'myTasks',
      label: 'My Tasks',
      icon: User,
      action: () => onFilterChange({ assignedToMe: true }),
    },
    {
      id: 'separator1',
      type: 'separator',
    },
    {
      id: 'dueThisWeek',
      label: 'Due This Week',
      icon: Calendar,
      action: () => onFilterChange({ dueThisWeek: true }),
    },
    {
      id: 'dueThisMonth',
      label: 'Due This Month',
      icon: Calendar,
      action: () => onFilterChange({ dueThisMonth: true }),
    },
    {
      id: 'separator2',
      type: 'separator',
    },
    {
      id: 'byAssignee',
      label: 'By Assignee',
      icon: UserPlus,
      submenu: true,
    },
    {
      id: 'byDueDate',
      label: 'By Due Date',
      icon: Calendar,
      submenu: true,
    },
  ];

  // Sort options
  const sortOptions = [
    {
      id: 'startDate',
      label: 'Start Date',
      icon: Clock,
      field: 'startDate',
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      icon: Calendar,
      field: 'dueDate',
    },
    {
      id: 'assignee',
      label: 'Assignee',
      icon: User,
      field: 'assigneeName',
    },
    {
      id: 'separator1',
      type: 'separator',
    },
    {
      id: 'createdAt',
      label: 'Created On',
      icon: Clock,
      field: 'createdAt',
    },
    {
      id: 'createdBy',
      label: 'Created By',
      icon: UserPlus,
      field: 'createdBy',
    },
    {
      id: 'updatedAt',
      label: 'Last Modified',
      icon: FileEdit,
      field: 'updatedAt',
    },
    {
      id: 'separator2',
      type: 'separator',
    },
    {
      id: 'alphabetical',
      label: 'Alphabetical (A-Z)',
      icon: SortAsc,
      field: 'title',
      direction: 'asc',
    },
    {
      id: 'alphabeticalDesc',
      label: 'Alphabetical (Z-A)',
      icon: SortAsc,
      field: 'title',
      direction: 'desc',
    },
  ];

  const handleFilterSelect = (option) => {
    if (option.action) {
      option.action();
      setFilterMenuOpen(false);
    }
  };

  const handleSortSelect = (option) => {
    if (option.field) {
      onSortChange({
        field: option.field,
        direction: option.direction || 'asc',
      });
      setSortMenuOpen(false);
    }
  };

  const handleColumnToggle = (columnId, visible) => {
    onColumnVisibilityChange(columnId, !visible);
  };

  const handleClearFilters = () => {
    onFilterChange({});
    setFilterMenuOpen(false);
  };

  const handleClearSort = () => {
    onSortChange(null);
    setSortMenuOpen(false);
  };

  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] !== undefined && activeFilters[key] !== null
  ).length;

  // Get visible columns count
  const visibleColumnsCount = columns.filter((col) => col.visible !== false).length;
  const totalColumnsCount = columns.length;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
      {/* Filter Button */}
      <DropdownMenu open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="w-4 h-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => {
            if (option.type === 'separator') {
              return <DropdownMenuSeparator key={option.id} />;
            }

            const Icon = option.icon;
            const isActive = activeFilters[option.id];

            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => handleFilterSelect(option)}
                className={cn(isActive && 'bg-primary/10')}
              >
                <Icon className="w-4 h-4 mr-2" />
                {option.label}
              </DropdownMenuItem>
            );
          })}
          {activeFilterCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClearFilters} className="text-red-600">
                Clear All Filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Button */}
      <DropdownMenu open={sortMenuOpen} onOpenChange={setSortMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort
            {activeSort && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                1
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Sort Tasks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => {
            if (option.type === 'separator') {
              return <DropdownMenuSeparator key={option.id} />;
            }

            const Icon = option.icon;
            const isActive =
              activeSort?.field === option.field &&
              (option.direction ? activeSort?.direction === option.direction : true);

            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => handleSortSelect(option)}
                className={cn(isActive && 'bg-primary/10')}
              >
                <Icon className="w-4 h-4 mr-2" />
                {option.label}
              </DropdownMenuItem>
            );
          })}
          {activeSort && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClearSort} className="text-red-600">
                Clear Sort
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Columns Visibility Button */}
      <DropdownMenu open={columnsMenuOpen} onOpenChange={setColumnsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Columns3 className="w-4 h-4 mr-2" />
            Columns
            <span className="ml-2 text-xs text-gray-500">
              ({visibleColumnsCount}/{totalColumnsCount})
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-96 overflow-y-auto">
            {columns.map((column) => {
              const isVisible = column.visible !== false;
              const isSystem = column.isSystem || false;
              const isDefault = column.isDefault || false;

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={isVisible}
                  onCheckedChange={() => handleColumnToggle(column.id, isVisible)}
                  disabled={isSystem} // System columns cannot be hidden
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {isVisible ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span>{column.name}</span>
                  </div>
                  {isSystem && (
                    <span className="text-xs text-gray-400 ml-2">(System)</span>
                  )}
                  {isDefault && !isSystem && (
                    <span className="text-xs text-blue-600 ml-2">(Default)</span>
                  )}
                </DropdownMenuCheckboxItem>
              );
            })}
          </div>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-gray-500">
            System columns cannot be hidden
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 ml-4 text-sm text-gray-600">
          <span>Active filters:</span>
          <div className="flex gap-1">
            {Object.entries(activeFilters).map(([key, value]) => {
              if (value === undefined || value === null) return null;
              const filterOption = filterOptions.find((opt) => opt.id === key);
              return (
                <span
                  key={key}
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                >
                  {filterOption?.label || key}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Sort Display */}
      {activeSort && (
        <div className="flex items-center gap-2 ml-4 text-sm text-gray-600">
          <span>Sorted by:</span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md">
            {sortOptions.find((opt) => opt.field === activeSort.field)?.label || activeSort.field}
            {' '}
            ({activeSort.direction === 'asc' ? '↑' : '↓'})
          </span>
        </div>
      )}
    </div>
  );
};

ListViewToolbar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onColumnVisibilityChange: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      visible: PropTypes.bool,
      isSystem: PropTypes.bool,
      isDefault: PropTypes.bool,
    })
  ),
  activeFilters: PropTypes.object,
  activeSort: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  projectMembers: PropTypes.array,
};

export default ListViewToolbar;
