import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userId, projectId, viewMode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic check - if no params provided, we'll show dashboard anyway
    // In a real app, you'd fetch the user's default project here
    setLoading(false);
  }, [userId, projectId, viewMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600">
            {user?.fullName ? `Hello, ${user.fullName}!` : 'Hello!'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Project Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {projectId && (
                <p>
                  <span className="font-medium">Project ID:</span> {projectId}
                </p>
              )}
              {viewMode && (
                <p>
                  <span className="font-medium">View Mode:</span> {viewMode}
                </p>
              )}
              {userId && (
                <p>
                  <span className="font-medium">User ID:</span> {userId}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                Create New Task
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                View All Projects
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                Team Members
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-semibold text-lg">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-lg text-green-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold text-lg text-blue-600">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            🎉 Welcome to Your Workspace!
          </h2>
          <p className="text-blue-800">
            You've successfully completed onboarding. This is your dashboard where you'll manage your projects and tasks.
            The full dashboard functionality will be implemented soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
