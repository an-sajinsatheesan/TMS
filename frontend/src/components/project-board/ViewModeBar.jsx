import { List, LayoutGrid, Table2, Calendar, GanttChart, Activity, BarChart3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const ViewModeBar = ({ currentView, onViewChange }) => {
  const navigate = useNavigate();
  const { userId, projectId } = useParams();

  const viewModes = [
    { value: 'overview', label: 'Overview', icon: Activity, type: 'navigation' },
    { value: 'dashboard', label: 'Dashboard', icon: BarChart3, type: 'navigation' },
    { value: 'list', label: 'List', icon: List, type: 'view' },
    { value: 'kanban', label: 'Board', icon: LayoutGrid, type: 'view' },
    { value: 'table', label: 'Table', icon: Table2, type: 'view' },
    { value: 'calendar', label: 'Calendar', icon: Calendar, disabled: true, type: 'view' },
    { value: 'gantt', label: 'Gantt', icon: GanttChart, disabled: true, type: 'view' },
  ];

  const handleTabChange = (value) => {
    // All view modes now change within the project board
    onViewChange?.(value);
  };

  return (
    <div className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-12 items-center justify-between px-6">
        {/* Left Side - View Tabs */}
        <Tabs value={currentView} onValueChange={handleTabChange} className="w-auto">
          <TabsList className="h-9 bg-gray-100">
            {viewModes.map((mode) => (
              <TabsTrigger
                key={mode.value}
                value={mode.value}
                disabled={mode.disabled}
                className={cn(
                  'gap-2 data-[state=active]:bg-white',
                  mode.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <mode.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{mode.label}</span>
                {mode.disabled && (
                  <span className="hidden lg:inline text-xs text-gray-400">(Soon)</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Right Side - Task Summary */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              <span>All</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModeBar;
