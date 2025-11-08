import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, Plus, Trash2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createColumn, updateColumn } from '@/store/slices/columnsSlice';

const COLOR_OPTIONS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

const COLUMN_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'user', label: 'User' },
  { value: 'checkbox', label: 'Checkbox' },
];

const ColumnFormDialog = ({ isOpen, onClose, projectId, column = null, initialType = 'text' }) => {
  const dispatch = useDispatch();
  const isEdit = !!column;
  const isDefaultColumn = column?.isDefault || false;

  const [formData, setFormData] = useState({
    name: '',
    type: initialType,
    width: 150,
    visible: true,
    options: [],
  });
  const [newOption, setNewOption] = useState({ label: '', value: '', color: COLOR_OPTIONS[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);

  // Initialize form data when dialog opens or column changes
  useEffect(() => {
    if (isOpen) {
      if (column) {
        setFormData({
          name: column.name || '',
          type: column.type || 'text',
          width: column.width || 150,
          visible: column.visible !== false,
          options: column.options || [],
        });
      } else {
        setFormData({
          name: '',
          type: initialType,
          width: 150,
          visible: true,
          options: [],
        });
      }
      setError(null);
    }
  }, [isOpen, column, initialType]);

  const requiresOptions = formData.type === 'select' || formData.type === 'multiselect';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Column name is required');
      return;
    }

    if (requiresOptions && formData.options.length === 0) {
      setError('At least one option is required for select/multi-select columns');
      return;
    }

    setLoading(true);
    try {
      const columnData = {
        name: formData.name.trim(),
        type: formData.type,
        width: formData.width,
        visible: formData.visible,
      };

      // Only include options for select/multiselect types
      if (requiresOptions) {
        columnData.options = formData.options;
      }

      if (isEdit) {
        await dispatch(updateColumn({
          projectId,
          columnId: column.id,
          updates: columnData
        })).unwrap();
      } else {
        await dispatch(createColumn({ projectId, columnData })).unwrap();
      }

      handleClose();
    } catch (err) {
      setError(err?.message || 'Failed to save column');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: initialType,
      width: 150,
      visible: true,
      options: [],
    });
    setNewOption({ label: '', value: '', color: COLOR_OPTIONS[0] });
    setError(null);
    onClose();
  };

  const handleAddOption = () => {
    if (!newOption.label.trim()) {
      setError('Option label is required');
      return;
    }

    // Auto-generate value from label if not provided
    const value = newOption.value.trim() || newOption.label.toLowerCase().replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { label: newOption.label.trim(), value, color: newOption.color }],
    }));
    setNewOption({
      label: '',
      value: '',
      color: COLOR_OPTIONS[(formData.options.length + 1) % COLOR_OPTIONS.length]
    });
    setError(null);
  };

  const handleRemoveOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleTypeChange = (newType) => {
    // If changing away from select/multiselect, clear options
    const needsOptions = newType === 'select' || newType === 'multiselect';
    setFormData(prev => ({
      ...prev,
      type: newType,
      options: needsOptions ? prev.options : [],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Column' : 'Create New Column'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* First Row: Field Title and Type Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            {/* Column Name */}
            <div className="space-y-2">
              <Label htmlFor="columnName">
                Field Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="columnName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Status, Priority"
                maxLength={100}
                autoFocus
              />
            </div>

            {/* Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="columnType">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
                disabled={isDefaultColumn} // Prevent changing type for default columns
              >
                <SelectTrigger id="columnType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isDefaultColumn && (
                <p className="text-xs text-gray-500">Default columns cannot change type</p>
              )}
            </div>
          </div>

          {/* Column Width */}
          <div className="space-y-2">
            <Label htmlFor="width">Column Width (pixels)</Label>
            <Input
              id="width"
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 150 })}
              min="50"
              max="500"
            />
          </div>

          {/* Options for Select/Multi-Select - Dynamically Displayed */}
          {requiresOptions && (
            <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <Label className="text-sm font-semibold">
                Options <span className="text-red-500">*</span>
              </Label>

              {/* Existing Options */}
              {formData.options.length > 0 && (
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-gray-300"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="flex-1 text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500 font-mono">({option.value})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 hover:bg-red-50 rounded"
                        title="Delete option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Option */}
              <div className="border border-gray-300 rounded-lg p-3 bg-white space-y-3">
                <div className="flex items-center gap-2">
                  {/* Color Selector - Rounded Button with Popover */}
                  <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-gray-400 transition-all hover:scale-110"
                        style={{ backgroundColor: newOption.color }}
                        title="Choose color"
                      >
                        {colorPopoverOpen && <Check className="w-5 h-5 text-white mx-auto drop-shadow" />}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Select Color</Label>
                        <div className="grid grid-cols-8 gap-2">
                          {COLOR_OPTIONS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setNewOption({ ...newOption, color });
                                setColorPopoverOpen(false);
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                newOption.color === color
                                  ? 'border-gray-900 scale-110'
                                  : 'border-gray-200 hover:scale-105 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {newOption.color === color && (
                                <Check className="w-4 h-4 text-white mx-auto drop-shadow" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Option Input Field */}
                  <Input
                    type="text"
                    value={newOption.label}
                    onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                    placeholder="Option label (e.g., In Progress)"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />

                  {/* Add Button */}
                  <Button
                    type="button"
                    onClick={handleAddOption}
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Press Enter or click + to add option
                </p>
              </div>
            </div>
          )}

          {/* Visible Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Label htmlFor="visible" className="text-sm font-normal cursor-pointer">
              Show column by default
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Column')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormDialog;
