import { Plus, UserPlus, CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DashboardContent = () => {
  // Mock data
  const thisWeekTasks = [
    { id: 1, title: 'Design new homepage', status: 'in-progress', dueDate: 'Today', priority: 'high' },
    { id: 2, title: 'Review API documentation', status: 'todo', dueDate: 'Tomorrow', priority: 'medium' },
    { id: 3, title: 'Fix authentication bug', status: 'in-progress', dueDate: 'Friday', priority: 'urgent' },
  ];

  const reviewTasks = [
    { id: 1, title: 'Pull Request #123', author: 'John Doe', status: 'pending', priority: 'high' },
    { id: 2, title: 'Design mockups v2', author: 'Jane Smith', status: 'pending', priority: 'medium' },
  ];

  const activities = [
    { id: 1, user: 'John Doe', action: 'completed task', item: 'User authentication', time: '2 hours ago', avatar: '' },
    { id: 2, user: 'Jane Smith', action: 'created project', item: 'Mobile App Redesign', time: '4 hours ago', avatar: '' },
    { id: 3, user: 'Bob Wilson', action: 'commented on', item: 'Homepage Layout', time: '5 hours ago', avatar: '' },
    { id: 4, user: 'Alice Brown', action: 'invited', item: 'Charlie Davis', time: 'Yesterday', avatar: '' },
  ];

  const projectStats = {
    total: 12,
    completed: 5,
    inProgress: 4,
    blocked: 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Action Cards in a Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Create Project Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Create Project</CardTitle>
            <CardDescription className="text-xs">Start a new project</CardDescription>
          </CardContent>
        </Card>

        {/* Invite Teams Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-400">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Invite Teams</CardTitle>
            <CardDescription className="text-xs">Add team members</CardDescription>
          </CardContent>
        </Card>

        {/* Create Task Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-400">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Create Task</CardTitle>
            <CardDescription className="text-xs">Add a new task</CardDescription>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-50">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Progress</CardTitle>
            <CardDescription className="text-xs">{projectStats.completed}/{projectStats.total} tasks done</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 2 Cards in a Row - To Do This Week & To Review */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* To Do This Week */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <CardTitle>To Do This Week</CardTitle>
              </div>
              <Badge variant="secondary">{thisWeekTasks.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {thisWeekTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">{task.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardContent>
        </Card>

        {/* To Review */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>To Review</CardTitle>
              </div>
              <Badge variant="secondary">{reviewTasks.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">by {task.author}</span>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              View All Reviews
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.avatar} alt={activity.user} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-600">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Task Progress Overview</CardTitle>
          <CardDescription>Overall project completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {Math.round((projectStats.completed / projectStats.total) * 100)}%
                </span>
              </div>
              <Progress
                value={(projectStats.completed / projectStats.total) * 100}
                className="h-3"
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Total</span>
                </div>
                <p className="text-2xl font-bold">{projectStats.total}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-600">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{projectStats.completed}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-blue-600">In Progress</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{projectStats.inProgress}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-red-600">Blocked</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{projectStats.blocked}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;
