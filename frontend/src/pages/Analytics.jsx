import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Clock,
  FolderKanban,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Analytics = () => {
  // Mock analytics data
  const stats = [
    {
      title: 'Total Projects',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completed Tasks',
      value: '1,234',
      change: '+18%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Team Members',
      value: '48',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Avg. Completion Time',
      value: '4.2 days',
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const projectPerformance = [
    { name: 'Website Redesign', completed: 75, color: 'bg-blue-500' },
    { name: 'Mobile App', completed: 60, color: 'bg-purple-500' },
    { name: 'Marketing Campaign', completed: 90, color: 'bg-green-500' },
    { name: 'API Development', completed: 45, color: 'bg-orange-500' },
    { name: 'Analytics Dashboard', completed: 30, color: 'bg-pink-500' },
  ];

  const teamActivity = [
    { day: 'Mon', tasks: 12 },
    { day: 'Tue', tasks: 19 },
    { day: 'Wed', tasks: 15 },
    { day: 'Thu', tasks: 22 },
    { day: 'Fri', tasks: 18 },
    { day: 'Sat', tasks: 8 },
    { day: 'Sun', tasks: 5 },
  ];

  const maxTasks = Math.max(...teamActivity.map((d) => d.tasks));

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your team's performance and project metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">from last month</span>
                    </div>
                  </div>
                  <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', stat.bgColor)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Project Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Project Performance</CardTitle>
              <CardDescription>Completion percentage by project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectPerformance.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-gray-500">{project.completed}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn('h-2 rounded-full transition-all', project.color)}
                      style={{ width: `${project.completed}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Tasks completed this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {teamActivity.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative">
                      <div
                        className="w-full bg-primary rounded-t-md transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${(day.tasks / maxTasks) * 200}px` }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{day.day}</div>
                      <div className="text-xs text-gray-500">{day.tasks}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: 'John Doe',
                  action: 'completed task',
                  target: 'Design homepage mockup',
                  time: '2 hours ago',
                },
                {
                  user: 'Jane Smith',
                  action: 'created project',
                  target: 'Mobile App Redesign',
                  time: '4 hours ago',
                },
                {
                  user: 'Bob Wilson',
                  action: 'commented on',
                  target: 'API Development',
                  time: '5 hours ago',
                },
                {
                  user: 'Alice Brown',
                  action: 'updated status',
                  target: 'Marketing Campaign',
                  time: '1 day ago',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder Notice */}
        <Card className="border-dashed border-2">
          <CardContent className="p-8">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="font-semibold text-lg">Analytics (UI Placeholder)</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                This is a placeholder UI with mock data. Real-time analytics, detailed reports,
                and data visualizations will be implemented with actual backend integration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
