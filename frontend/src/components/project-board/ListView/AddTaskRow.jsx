import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Column width mapping
const getColumnWidthClass = (width) => {
  if (width <= 64) return 'w-16';
  if (width <= 100) return 'w-24';
  if (width <= 150) return 'w-32';
  if (width <= 200) return 'w-48';
  if (width <= 300) return 'w-64';
  return 'w-80';
};

const AddTaskRow = ({ sectionId, onAddTask, columnWidths, scrollableColumns = [] }) => {
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
        className="group hover:bg-gray-50 cursor-pointer transition-colors border-b min-h-[32px]"
        onClick={() => setIsAdding(true)}
      >
        <div className="flex w-max min-w-full border-b">
          {/* Checkbox Column - Sticky Left */}
          <div className={cn(columnWidths.checkbox, 'sticky left-0 flex-shrink-0 border-r bg-white group-hover:bg-gray-50')} />

          {/* Add Task Button - Sticky Left */}
          <div className={cn(columnWidths.taskName, 'sticky left-8 flex-shrink-0 bg-white group-hover:bg-gray-50 border-r px-2 py-1 flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-700')}>
            <Plus className="h-4 w-4" />
            <span>Add task...</span>
          </div>

          {/* Scrollable alignment columns */}
          <div className="flex-1 flex">
            {scrollableColumns.map((column) => {
              const widthClass = getColumnWidthClass(column.width);
              return (
                <div
                  key={column.id}
                  className={cn(widthClass, 'bg-white group-hover:bg-gray-50')}
                />
              );
            })}
          </div>

          {/* Actions Column - Sticky Right */}
          <div className={cn(columnWidths.addColumn, 'sticky right-0 flex-shrink-0 border-l bg-white group-hover:bg-gray-50')} />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-white min-h-[32px]">
      <div className="flex w-max min-w-full border-b">
        {/* Checkbox Column - Sticky Left */}
        <div className={cn(columnWidths.checkbox, 'sticky left-0 flex-shrink-0 border-r bg-white')} />

        {/* Task Name Input - Sticky Left */}
        <div className={cn(columnWidths.taskName, 'sticky left-8 flex-shrink-0 bg-white border-r px-2 py-1 flex items-center gap-2')}>
          <Input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task name..."
            className="h-6 text-xs border-gray-300 focus:border-blue-500 flex-1"
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

        {/* Scrollable alignment columns */}
        <div className="flex-1 flex">
          {scrollableColumns.map((column) => {
            const widthClass = getColumnWidthClass(column.width);
            return (
              <div
                key={column.id}
                className={cn(widthClass, 'bg-white')}
              />
            );
          })}
        </div>

        {/* Actions Column - Sticky Right */}
        <div className={cn(columnWidths.addColumn, 'sticky right-0 flex-shrink-0 border-l bg-white')} />
      </div>
    </div>
  );
};

export default AddTaskRow;
