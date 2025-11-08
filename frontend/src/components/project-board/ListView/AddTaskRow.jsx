import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FIXED_COLUMNS = {
  drag: 40,
  taskName: 320,
};

const AddTaskRow = ({ sectionId, onAddTask }) => {
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
        className="group flex w-max min-w-full items-center border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setIsAdding(true)}
      >
        {/* Drag Icon Placeholder */}
        <div className="border-r border-gray-200" style={{ width: FIXED_COLUMNS.drag }} />

        {/* Add Task Button - Spans Task Name Column */}
        <div className="px-2 py-1 flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-700" style={{ width: FIXED_COLUMNS.taskName }}>
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-max min-w-full items-center border-b border-gray-200 bg-white">
      {/* Drag Icon Placeholder */}
      <div className="border-r border-gray-200" style={{ width: FIXED_COLUMNS.drag }} />

      {/* Task Name Input */}
      <div className="px-2 py-1 flex items-center gap-2" style={{ width: FIXED_COLUMNS.taskName }}>
        <Input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name..."
          className="h-7 text-sm border-gray-300 focus:border-blue-500"
          autoFocus
        />
        <div className="flex items-center gap-1">
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
    </div>
  );
};

export default AddTaskRow;
