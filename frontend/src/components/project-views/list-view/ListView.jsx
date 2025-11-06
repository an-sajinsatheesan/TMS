const ListView = ({ tasks = [], sections = [], onTaskClick }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">List View</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task.id)}
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="font-medium">{task.title || task.name}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center py-8">No tasks yet. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default ListView;
