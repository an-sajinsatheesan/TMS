import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardContent from '../components/dashboard/DashboardContent';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userId, projectId, viewMode } = useParams();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(viewMode || 'list');

  return (
    <DashboardLayout>
      <DashboardContent viewMode={currentView} />
    </DashboardLayout>
  );
};

export default Dashboard;
