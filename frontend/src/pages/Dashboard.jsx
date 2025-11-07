import DashboardLayout from '../components/overall-dashboard/DashboardLayout';
import DashboardContent from '../components/overall-dashboard/DashboardContent';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
};

export default Dashboard;
