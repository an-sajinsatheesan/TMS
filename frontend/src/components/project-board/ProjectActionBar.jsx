import { Plus, Filter, ArrowUpDown, Columns3, CheckSquare, Target, FolderPlus, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ListViewToolbar from './ListView/ListViewToolbar';
import { useListView } from '@/contexts/ListViewContext';

const ProjectActionBar = ({
  onAddTask,
  onAddSection,
  focusedSectionId,
}) => {
  const listViewContext = useListView();

  const handleAddOption = (type) => {
    if (type === 'section') {
      onAddSection?.();
    } else {
      // For milestone, task, and approval - add to focused section
      onAddTask?.(type, focusedSectionId);
    }
  };

  return (
    <div className="z-20 border-b bg-white flex-shrink-0">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left Side - Add Actions */}
        <div className="flex items-center gap-2">
          {/* Unified Add Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => handleAddOption('milestone')}>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>Milestone</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddOption('task')}>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span>Task</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAddOption('section')}>
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-green-600" />
                  <span>Section</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddOption('approval')}>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-orange-600" />
                  <span>Approval</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {focusedSectionId && (
            <span className="text-xs text-gray-500 ml-2">
              Adding to focused section
            </span>
          )}
        </div>

        {/* Right Side - View Controls */}
        <ListViewToolbar
          onFilterChange={listViewContext?.onFilterChange || (() => {})}
          onSortChange={listViewContext?.onSortChange || (() => {})}
          onColumnVisibilityChange={listViewContext?.onColumnVisibilityChange || (() => {})}
          columns={listViewContext?.columns || []}
          activeFilters={listViewContext?.activeFilters || {}}
          activeSort={listViewContext?.activeSort || null}
          projectMembers={listViewContext?.projectMembers || []}
        />
      </div>
    </div>
  );
};

export default ProjectActionBar;
