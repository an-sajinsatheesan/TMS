import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ProjectHeader from '../../components/dashboard/ProjectHeader';
import ProjectTabs from '../../components/dashboard/ProjectTabs';

const Workspace = () => {
  const { tenantId } = useParams();
  const [activeTab, setActiveTab] = useState('list');

  // Sample team members data
  const teamMembers = [
    { name: 'Alice', initials: 'AL', color: '#E91E63' },
    { name: 'David', initials: 'D1', color: '#4CAF50' },
  ];

  return (
    <DashboardLayout>
      {/* Project Header */}
      <ProjectHeader
        projectName="Craftboard Project"
        projectIcon="C"
        projectColor="bg-purple-500"
        teamMembers={teamMembers}
      />

      {/* Project Tabs */}
     {/*  <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} /> */}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Content will be rendered here based on active tab */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              Content for <span className="font-semibold text-gray-900">{activeTab}</span> view will be displayed here.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Workspace ID: {tenantId}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Workspace;
