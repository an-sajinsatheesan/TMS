import { useState } from 'react';
import { Plus, Type, Hash, Calendar, List, CheckSquare, User } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ColumnFormDialog from './ColumnFormDialog';

const COLUMN_TYPES = [
  {
    value: 'text',
    label: 'Text',
    icon: Type,
    description: 'Single line text'
  },
  {
    value: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric value'
  },
  {
    value: 'date',
    label: 'Date',
    icon: Calendar,
    description: 'Date picker'
  },
  {
    value: 'select',
    label: 'Select',
    icon: List,
    description: 'Single selection'
  },
  {
    value: 'multiselect',
    label: 'Multi-Select',
    icon: CheckSquare,
    description: 'Multiple selections'
  },
  {
    value: 'user',
    label: 'User',
    icon: User,
    description: 'Assign member'
  },
];

const AddColumnPopover = ({ projectId }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTypeClick = (type) => {
    setSelectedType(type);
    setIsPopoverOpen(false);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedType(null);
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
            title="Add Column"
          >
            <Plus className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
              Add Column
            </div>
            {COLUMN_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleTypeClick(type.value)}
                  className="w-full flex items-start gap-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {type.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Column Form Dialog */}
      {selectedType && (
        <ColumnFormDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          projectId={projectId}
          columnType={selectedType}
        />
      )}
    </>
  );
};

export default AddColumnPopover;
