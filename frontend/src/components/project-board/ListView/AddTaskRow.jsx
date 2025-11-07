import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const AddTaskRow = ({ sectionId, onAddTask, columns, columnWidths }) => {
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
        className="group flex items-center px-2 py-1 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setIsAdding(true)}
      >
        <div className={`${columnWidths.drag} flex-shrink-0`} />
        <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-700">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center border-b border-gray-200 bg-white">
      {/* Drag Icon Placeholder */}
      <div className={`${columnWidths.drag} flex-shrink-0`} />

      {/* Task Number Placeholder */}
      <div className={`${columnWidths.taskNumber} flex-shrink-0 px-2`} />

      {/* Task Name Input */}
      <div className={cn(columnWidths.taskName, 'flex-shrink-0 px-2 py-1 flex items-center gap-2 sticky left-[104px] z-10 bg-white')}>
        <Input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name..."
          className="h-6 text-xs border-gray-300 focus:border-blue-500"
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
