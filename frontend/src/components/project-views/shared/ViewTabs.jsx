const ViewTabs = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'list', label: 'List' },
    { id: 'board', label: 'Board' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <div className="flex gap-2 border-b">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={
            activeView === view.id
              ? 'px-4 py-2 border-b-2 border-blue-500 text-blue-600 transition-colors'
              : 'px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 transition-colors'
          }
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default ViewTabs;
