import { useState } from 'react';
import PropTypes from 'prop-types';

const ProjectTabs = ({ activeTab, onTabChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'list', label: 'List', icon: 'pi pi-list' },
    { id: 'kanban', label: 'Kanban', icon: 'pi pi-th-large' },
    { id: 'timeline', label: 'Timeline', icon: 'pi pi-chart-bar' },
    { id: 'calendar', label: 'Calendar', icon: 'pi pi-calendar' },
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
  };

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ..."
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="pi pi-filter text-xs"></i>
            <span>Filter</span>
          </button>

          {/* New Task Button */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <i className="pi pi-plus text-xs"></i>
            <span>New Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ProjectTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired
};

export default ProjectTabs;
