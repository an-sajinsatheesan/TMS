import { useState } from 'prop-types';
import PropTypes from 'prop-types';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SelectField = ({ taskId, column, currentValue, onValueChange }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = async (value) => {
    if (onValueChange) {
      await onValueChange(taskId, column.id, value);
    }
    setOpen(false);
  };

  const handleClear = async (e) => {
    e.stopPropagation();
    if (onValueChange) {
      await onValueChange(taskId, column.id, null);
    }
    setOpen(false);
  };

  const selectedOption = column.options?.find(opt => opt.value === currentValue);

  const triggerContent = selectedOption ? (
    <Badge
      variant="outline"
      className="text-xs px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: selectedOption.color + '20' || 'transparent',
        borderColor: selectedOption.color || 'gray',
        color: selectedOption.color || 'inherit',
      }}
    >
      {selectedOption.label || currentValue}
      <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
    </Badge>
  ) : (
    <div className="flex items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">
      <span className="text-xs">Set {column.name.toLowerCase()}</span>
      <ChevronDown className="h-3 w-3" />
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent w-full justify-start"
        >
          {triggerContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            Select {column.name.toLowerCase()}
          </div>

          {/* Options list */}
          <div className="space-y-1">
            {column.options && column.options.length > 0 ? (
              column.options.map((option) => {
                const isSelected = option.value === currentValue;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex items-center justify-between w-full px-2 py-2 rounded hover:bg-gray-100 transition-colors',
                      isSelected && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="text-xs font-medium">{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-2 py-4 text-xs text-gray-500 text-center">
                No options available
              </div>
            )}
          </div>

          {/* Clear option */}
          {currentValue && (
            <>
              <div className="border-t my-1" />
              <button
                onClick={handleClear}
                className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-gray-100 transition-colors text-xs text-gray-600"
              >
                Clear {column.name.toLowerCase()}
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

SelectField.propTypes = {
  taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  currentValue: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
};

export default SelectField;
