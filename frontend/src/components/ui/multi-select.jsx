import { Badge } from './badge';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MultiSelect({ options = [], value = [], onChange, placeholder = "Select...", optionLabel = "label", optionValue = "value", disabled = false }) {
  const selectedLabels = options
    .filter(opt => value.includes(opt[optionValue]))
    .map(opt => opt[optionLabel]);

  const toggleOption = (optionVal) => {
    const newValue = value.includes(optionVal)
      ? value.filter(v => v !== optionVal)
      : [...value, optionVal];
    onChange(newValue);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          {selectedLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="max-h-64 overflow-auto p-2">
          {options.map((option) => {
            const isSelected = value.includes(option[optionValue]);
            return (
              <div
                key={option[optionValue]}
                onClick={() => toggleOption(option[optionValue])}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-sm hover:bg-accent",
                  isSelected && "bg-accent"
                )}
              >
                <div className={cn(
                  "h-4 w-4 border rounded-sm flex items-center justify-center",
                  isSelected && "bg-primary border-primary"
                )}>
                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="text-sm">{option[optionLabel]}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
