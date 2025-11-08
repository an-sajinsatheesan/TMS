import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const AddTaskRow = ({ sectionId, onAddTask, columnWidths, scrollableColumnCount = 0 }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState('');

  const handleSubmit = () => {
    if (taskName.trim()) {
      onAddTask(sectionId, taskName.trim());
      setTaskName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTaskName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <div
        className="group hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-200 min-h-[36px]"
        onClick={() => setIsAdding(true)}
      >
        <div className="flex min-w-max">
          {/* Drag Icon Placeholder - Sticky Left */}
          <div className={cn(columnWidths.drag, 'sticky z-20 bg-white group-hover:bg-gray-50 border-r border-gray-200')} style={{ left: 0 }} />

          {/* Add Task Button - Sticky Left */}
          <div className={cn(columnWidths.taskName, 'sticky z-20 bg-white group-hover:bg-gray-50   px-2 py-2 flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-700')} style={{ left: '40px' }}>
            <Plus className="h-4 w-4" />
            <span>Add task...</span>
          </div>

          {/* Scrollable empty space - fills the rest */}
          <div className="flex-1 bg-white group-hover:bg-gray-50 border-r border-gray-200" />

          {/* Actions Column - Sticky Right */}
          <div className={cn(columnWidths.addColumn, 'sticky z-20 bg-white group-hover:bg-gray-50 border-l border-gray-200')} style={{ right: 0 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 bg-white min-h-[36px]">
      <div className="flex min-w-max">
        {/* Drag Icon Placeholder - Sticky Left */}
        <div className={cn(columnWidths.drag, 'sticky z-20 bg-white border-r border-gray-200')} style={{ left: 0 }} />

        {/* Task Name Input - Sticky Left */}
        <div className={cn(columnWidths.taskName, 'sticky z-20 bg-white border-r border-gray-200 px-2 py-1 flex items-center gap-2')} style={{ left: '40px' }}>
          <Input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task name..."
            className="h-7 text-sm border-gray-300 focus:border-blue-500 flex-1"
            autoFocus
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleSubmit}
              disabled={!taskName.trim()}
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleCancel}
            >
              <X className="h-3.5 w-3.5 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Scrollable empty space - fills the rest */}
        <div className="flex-1 bg-white border-r border-gray-200" />

        {/* Actions Column - Sticky Right */}
        <div className={cn(columnWidths.addColumn, 'sticky z-20 bg-white border-l border-gray-200')} style={{ right: 0 }} />
      </div>
    </div>
  );
};

export default AddTaskRow;
