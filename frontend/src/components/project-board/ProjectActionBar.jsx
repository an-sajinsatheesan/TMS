import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ListViewToolbar from './ListView/ListViewToolbar';
import { useListView } from '@/contexts/ListViewContext';

const ProjectActionBar = ({
  onAddTask,
  onAddSection,
}) => {
  const listViewContext = useListView();
  return (
    <div className="sticky top-[3.05rem] z-20 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left Side - Add Actions */}
        <div className="flex items-center gap-2">
          {/* Add Task Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onAddTask?.('milestone')}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Milestone</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTask?.('task')}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Task</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTask?.('subtask')}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Subtask</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Section Button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onAddSection}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Section</span>
          </Button>
        </div>

        {/* Right Side - View Controls (ListView Toolbar when in list view) */}
        {listViewContext ? (
          <ListViewToolbar
            onFilterChange={listViewContext.onFilterChange}
            onSortChange={listViewContext.onSortChange}
            onColumnVisibilityChange={listViewContext.onColumnVisibilityChange}
            columns={listViewContext.columns}
            activeFilters={listViewContext.activeFilters}
            activeSort={listViewContext.activeSort}
            projectMembers={listViewContext.projectMembers}
          />
        ) : (
          <div className="text-sm text-gray-500">
            {/* Placeholder for other view modes */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectActionBar;
