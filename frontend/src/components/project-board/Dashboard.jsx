import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, Circle, AlertCircle, ListTodo } from 'lucide-react';
import { projectsService } from '../../services/api/projects.service';
import { toast } from 'sonner';

const COLORS = {
  completed: '#10b981',
  incomplete: '#3b82f6',
  overdue: '#ef4444',
};

const Dashboard = ({ projectId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchDashboardData();
    }
  }, [projectId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await projectsService.getDashboard(projectId);
      const data = response.data.data || response.data;
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set default empty data instead of null
      setDashboardData({
        summary: {
          totalTasks: 0,
          completedTasks: 0,
          incompleteTasks: 0,
          overdueTasks: 0,
        },
        charts: {
          tasksBySection: [],
          tasksByStatus: [],
          upcomingTasksByAssignee: [],
          taskCompletionOverTime: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    overdueTasks: 0,
  };

  const charts = dashboardData?.charts || {
    tasksBySection: [],
    tasksByStatus: [],
    upcomingTasksByAssignee: [],
    taskCompletionOverTime: [],
  };

  // Stats cards configuration
  const stats = [
    {
      title: 'Total Tasks',
      value: summary.totalTasks,
      icon: ListTodo,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Completed Tasks',
      value: summary.completedTasks,
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Incomplete Tasks',
      value: summary.incompleteTasks,
      icon: Circle,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
    },
    {
      title: 'Overdue Tasks',
      value: summary.overdueTasks,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
  ];

  // Format pie chart data
  const pieData = charts.tasksByStatus.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  const PIE_COLORS = [COLORS.incomplete, COLORS.completed];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row 1: Bar Chart and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Incomplete Tasks by Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Incomplete Tasks by Section
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.tasksBySection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by Completion Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tasks by Completion Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2: Assignee Bar Chart and Completion Line Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Tasks by Assignee */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Tasks by Assignee
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.upcomingTasksByAssignee}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="assignee"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Completion Over Time (Last 7 Days) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Task Completion (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.taskCompletionOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Completed Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
