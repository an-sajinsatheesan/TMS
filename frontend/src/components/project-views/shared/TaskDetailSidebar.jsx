const TaskDetailSidebar = ({ taskId, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l z-50 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <p className="text-gray-600">Task ID: {taskId}</p>
    </div>
  );
};

export default TaskDetailSidebar;
