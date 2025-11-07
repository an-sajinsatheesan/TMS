import { Plus, ArrowUpDown, Columns, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ProjectActionBar = ({
  onAddTask,
  onAddSection,
  onSort,
  onColumnCustomize,
  onFilter,
}) => {
  return (
    <div className="sticky top-28 z-20 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
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

        {/* Right Side - View Controls */}
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {/* Sort Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={onSort}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden md:inline">Sort</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sort tasks</p>
              </TooltipContent>
            </Tooltip>

            {/* Column Customization Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={onColumnCustomize}
                >
                  <Columns className="h-4 w-4" />
                  <span className="hidden md:inline">Columns</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Customize columns</p>
              </TooltipContent>
            </Tooltip>

            {/* Filter Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={onFilter}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden md:inline">Filter</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter tasks</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProjectActionBar;
