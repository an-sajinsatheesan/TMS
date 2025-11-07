import { List, LayoutGrid, Table2, Calendar, GanttChart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const ViewModeBar = ({ currentView, onViewChange }) => {
  const viewModes = [
    { value: 'list', label: 'List', icon: List },
    { value: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { value: 'table', label: 'Table', icon: Table2 },
    { value: 'calendar', label: 'Calendar', icon: Calendar, disabled: true },
    { value: 'gantt', label: 'Gantt', icon: GanttChart, disabled: true },
  ];

  return (
    <div className="sticky top-16 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-12 items-center justify-between px-6">
        {/* Left Side - View Tabs */}
        <Tabs value={currentView} onValueChange={onViewChange} className="w-auto">
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

        {/* Right Side - Placeholder for filters/summary */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>12 Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>8 Done</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              <span>3 Blocked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModeBar;
