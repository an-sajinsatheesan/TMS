import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createColumn } from '@/store/slices/columnsSlice';

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

const COLUMN_TYPE_LABELS = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  select: 'Select',
  multiselect: 'Multi-Select',
  user: 'User',
};

const ColumnFormDialog = ({ isOpen, onClose, projectId, columnType }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    width: 150,
    visible: true,
    options: [],
  });
  const [newOption, setNewOption] = useState({ label: '', value: '', color: COLOR_OPTIONS[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requiresOptions = columnType === 'select' || columnType === 'multiselect';

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
        type: columnType,
        width: formData.width,
        visible: formData.visible,
      };

      // Only include options for select/multiselect types
      if (requiresOptions) {
        columnData.options = formData.options;
      }

      await dispatch(createColumn({ projectId, columnData })).unwrap();

      // Reset form and close
      setFormData({
        name: '',
        width: 150,
        visible: true,
        options: [],
      });
      setNewOption({ label: '', value: '', color: COLOR_OPTIONS[0] });
      onClose();
    } catch (err) {
      setError(err || 'Failed to create column');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (!newOption.label.trim() || !newOption.value.trim()) {
      setError('Option label and value are required');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { ...newOption }],
    }));
    setNewOption({
      label: '',
      value: '',
      color: COLOR_OPTIONS[formData.options.length % COLOR_OPTIONS.length]
    });
    setError(null);
  };

  const handleRemoveOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add {COLUMN_TYPE_LABELS[columnType]} Column
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Column Name */}
          <div className="space-y-2">
            <Label htmlFor="columnName">
              Column Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="columnName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Status, Priority, Department"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Default Value (optional for some types) */}
          {(columnType === 'text' || columnType === 'number') && (
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default Value (Optional)</Label>
              <Input
                id="defaultValue"
                type={columnType === 'number' ? 'number' : 'text'}
                placeholder={`Enter default ${columnType} value`}
              />
            </div>
          )}

          {/* Column Width */}
          <div className="space-y-2">
            <Label htmlFor="width">Width (pixels)</Label>
            <Input
              id="width"
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 150 })}
              min="50"
              max="500"
            />
          </div>

          {/* Options for Select/Multi-Select */}
          {requiresOptions && (
            <div className="space-y-2">
              <Label>
                Options <span className="text-red-500">*</span>
              </Label>

              {/* Existing Options */}
              {formData.options.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      <span className="text-xs text-gray-500">({option.value})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Option */}
              <div className="border border-gray-300 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    value={newOption.label}
                    onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                    placeholder="Label (e.g., In Progress)"
                  />
                  <Input
                    type="text"
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                    placeholder="Value (e.g., in-progress)"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <Label className="text-xs mb-2 block">Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewOption({ ...newOption, color })}
                        className={`w-6 h-6 rounded border-2 transition-all ${
                          newOption.color === color
                            ? 'border-gray-900 scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddOption}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Visible Checkbox */}
          <div className="flex items-center gap-2">
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Column'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormDialog;
