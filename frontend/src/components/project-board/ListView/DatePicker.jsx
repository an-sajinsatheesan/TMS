import { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, endOfWeek, addWeeks, startOfMonth, endOfMonth, addMonths } from 'date-fns';

const DatePicker = ({ taskId, currentDate, onDateChange }) => {
  const [open, setOpen] = useState(false);

  const handleDateSelect = async (date) => {
    if (onDateChange) {
      await onDateChange(taskId, date);
    }
    setOpen(false);
  };

  const handleClear = async (e) => {
    e.stopPropagation();
    if (onDateChange) {
      await onDateChange(taskId, null);
    }
    setOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const triggerContent = currentDate ? (
    <div className="flex items-center gap-2 w-full group">
      <Calendar className="h-4 w-4 text-gray-500" />
      <span className="truncate text-xs flex-1">{formatDate(currentDate)}</span>
      <X
        className="h-3 w-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleClear}
      />
    </div>
  ) : (
    <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600">
      <Calendar className="h-4 w-4" />
      <span className="text-xs">Set date</span>
    </div>
  );

  const today = new Date();
  const quickOptions = [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: addDays(today, 1) },
    { label: 'This Weekend', date: addDays(startOfWeek(today), 6) },
    { label: 'Next Week', date: startOfWeek(addWeeks(today, 1)) },
    { label: 'Two Weeks', date: addWeeks(today, 2) },
    { label: 'Next Month', date: startOfMonth(addMonths(today, 1)) },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-gray-100 rounded px-2 py-1 w-full justify-start"
        >
          {triggerContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            Select due date
          </div>

          {/* Quick date options */}
          <div className="space-y-1">
            {quickOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleDateSelect(option.date.toISOString())}
                className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs font-medium">{option.label}</span>
                <span className="text-xs text-gray-500">
                  {format(option.date, 'MMM dd')}
                </span>
              </button>
            ))}
          </div>

          {/* Custom date input */}
          <div className="border-t my-2" />
          <div className="px-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Custom date
            </label>
            <input
              type="date"
              onChange={(e) => {
                if (e.target.value) {
                  handleDateSelect(new Date(e.target.value).toISOString());
                }
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear option */}
          {currentDate && (
            <>
              <div className="border-t my-2" />
              <button
                onClick={handleClear}
                className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 transition-colors text-xs text-red-600"
              >
                <X className="h-4 w-4" />
                Clear due date
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

DatePicker.propTypes = {
  taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentDate: PropTypes.string,
  onDateChange: PropTypes.func.isRequired,
};

export default DatePicker;
