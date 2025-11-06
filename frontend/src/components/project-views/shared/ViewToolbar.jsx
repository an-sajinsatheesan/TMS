const ViewToolbar = ({ onSearch, onFilter }) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <input
        type="text"
        placeholder="Search tasks..."
        onChange={(e) => onSearch?.(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg"
      />
      <button
        onClick={onFilter}
        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        Filter
      </button>
    </div>
  );
};

export default ViewToolbar;
