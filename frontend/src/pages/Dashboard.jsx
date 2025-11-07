import AppLayout from '../components/layout/AppLayout';
import DashboardContent from '../components/overall-dashboard/DashboardContent';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <DashboardContent />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
