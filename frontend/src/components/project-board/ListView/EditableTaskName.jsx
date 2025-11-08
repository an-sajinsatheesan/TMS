import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

const EditableTaskName = ({ taskId, value, onSave, isCompleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    if (!trimmedValue) {
      // Reset to original value if empty
      setEditValue(value);
      setIsEditing(false);
      return;
    }

    if (trimmedValue !== value) {
      try {
        await onSave(taskId, trimmedValue);
      } catch (error) {
        console.error('Failed to save task name:', error);
        // Reset to original value on error
        setEditValue(value);
      }
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="text-sm font-medium px-1 py-0.5 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
        onClick={(e) => e.stopPropagation()} // Prevent drag when clicking input
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={cn(
        'text-sm font-medium truncate cursor-text hover:bg-gray-100 px-1 py-0.5 rounded transition-colors',
        isCompleted && 'line-through text-gray-400'
      )}
    >
      {value}
    </span>
  );
};

EditableTaskName.propTypes = {
  taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  value: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  isCompleted: PropTypes.bool,
};

export default EditableTaskName;
