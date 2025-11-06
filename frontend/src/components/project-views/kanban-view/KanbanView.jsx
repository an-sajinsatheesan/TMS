const KanbanView = ({ tasks = [], sections = [], onTaskClick }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Kanban View</h2>
      <div className="flex gap-4 overflow-x-auto">
        {sections.map((section) => (
          <div key={section.id} className="min-w-[300px] bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">{section.name}</h3>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.sectionId === section.id)
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task.id)}
                    className="p-3 bg-white border rounded shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <p className="font-medium">{task.title || task.name}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-gray-500 py-8">No sections yet.</p>
        )}
      </div>
    </div>
  );
};

export default KanbanView;
