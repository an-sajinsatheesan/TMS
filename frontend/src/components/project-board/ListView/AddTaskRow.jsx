import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const AddTaskRow = ({ sectionId, onAddTask, columns }) => {
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
        className="group flex items-center px-3 py-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setIsAdding(true)}
      >
        <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-700">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center border-b border-gray-200 bg-white">
      {/* Drag Icon Placeholder */}
      <div className="w-10 flex-shrink-0" />

      {/* Task Number Placeholder */}
      <div className="w-16 flex-shrink-0 px-3" />

      {/* Task Name Input */}
      <div className="flex-1 min-w-0 px-3 py-2 flex items-center gap-2">
        <Input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name..."
          className="h-8 text-sm border-gray-300 focus:border-blue-500"
          autoFocus
        />
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleSubmit}
            disabled={!taskName.trim()}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskRow;
