import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Plus, Trash2 } from 'lucide-react';
import { createColumn } from '@/store/slices/columnsSlice';

const COLUMN_TYPES = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'number', label: 'Number', description: 'Numeric value' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'select', label: 'Select', description: 'Single selection dropdown' },
  { value: 'multiselect', label: 'Multi-Select', description: 'Multiple selection dropdown' },
  { value: 'checkbox', label: 'Checkbox', description: 'Yes/No checkbox' },
  { value: 'user', label: 'User', description: 'Assign team member' },
];

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

const AddColumnDialog = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    width: 150,
    visible: true,
    options: [],
  });
  const [newOption, setNewOption] = useState({ label: '', value: '', color: COLOR_OPTIONS[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      await dispatch(createColumn({ projectId, columnData })).unwrap();

      // Reset form and close
      setFormData({
        name: '',
        type: 'text',
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
    setNewOption({ label: '', value: '', color: COLOR_OPTIONS[formData.options.length % COLOR_OPTIONS.length] });
    setError(null);
  };

  const handleRemoveOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Column</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Column Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Status, Priority, Department"
              maxLength={100}
            />
          </div>

          {/* Column Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COLUMN_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value, options: [] })}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Column Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width (pixels)
            </label>
            <input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 150 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="50"
              max="500"
            />
          </div>

          {/* Options for Select/Multi-Select */}
          {requiresOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>

              {/* Existing Options */}
              {formData.options.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      <span className="text-xs text-gray-500">({option.value})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Option */}
              <div className="border border-gray-300 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newOption.label}
                    onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Label (e.g., In Progress)"
                  />
                  <input
                    type="text"
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Value (e.g., in-progress)"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Color</label>
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

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
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
            <label htmlFor="visible" className="text-sm text-gray-700">
              Show column by default
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Column'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnDialog;
