import { LayoutList, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ViewSwitcher = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        size="sm"
        variant={currentView === 'list' ? 'default' : 'ghost'}
        className={cn(
          'h-8 px-3 gap-2',
          currentView === 'list'
            ? 'bg-white shadow-sm'
            : 'hover:bg-gray-200'
        )}
        onClick={() => onViewChange('list')}
      >
        <LayoutList className="h-4 w-4" />
        <span className="text-sm">List</span>
      </Button>

      <Button
        size="sm"
        variant={currentView === 'kanban' ? 'default' : 'ghost'}
        className={cn(
          'h-8 px-3 gap-2',
          currentView === 'kanban'
            ? 'bg-white shadow-sm'
            : 'hover:bg-gray-200'
        )}
        onClick={() => onViewChange('kanban')}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="text-sm">Kanban</span>
      </Button>
    </div>
  );
};

export default ViewSwitcher;
