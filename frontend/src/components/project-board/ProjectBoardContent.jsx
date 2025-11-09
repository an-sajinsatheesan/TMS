import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ListView from './ListView/ListView';
import Overview from './Overview';
import Dashboard from './Dashboard';

const ProjectBoardContent = ({ viewMode = 'list', projectId }) => {
  // Mock tasks data
  const tasks = [
    {
      id: 1,
      title: 'Design new homepage layout',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-01-20',
      section: 'Design',
    },
    {
      id: 2,
      title: 'Implement user authentication',
      status: 'completed',
      priority: 'high',
      assignee: 'Jane Smith',
      dueDate: '2024-01-18',
      section: 'Development',
    },
    {
      id: 3,
      title: 'Write API documentation',
      status: 'todo',
      priority: 'medium',
      assignee: 'Bob Wilson',
      dueDate: '2024-01-25',
      section: 'Documentation',
    },
    {
      id: 4,
      title: 'Setup CI/CD pipeline',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Alice Brown',
      dueDate: '2024-01-22',
      section: 'DevOps',
    },
    {
      id: 5,
      title: 'Design mobile responsive layout',
      status: 'todo',
      priority: 'medium',
      assignee: 'Charlie Davis',
      dueDate: '2024-01-28',
      section: 'Design',
    },
    {
      id: 6,
      title: 'Fix reported bugs',
      status: 'blocked',
      priority: 'urgent',
      assignee: 'Eve Martinez',
      dueDate: '2024-01-19',
      section: 'Development',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
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

  if (viewMode === 'overview') {
    return <Overview projectId={projectId} />;
  }

  if (viewMode === 'dashboard') {
    return <Dashboard projectId={projectId} />;
  }

  if (viewMode === 'list') {
    // ListView has its own provider, just return it
    return <ListView projectId={projectId} />;
  }

  if (viewMode === 'kanban') {
    const columns = ['todo', 'in-progress', 'completed', 'blocked'];
    const columnTitles = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      completed: 'Completed',
      blocked: 'Blocked',
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <div key={status} className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{columnTitles[status]}</h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              <div className="space-y-3 flex-1">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{task.title}</h4>
                      <div className="space-y-2">
                        <Badge
                          variant="outline"
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority}
                        </Badge>
                        <p className="text-sm text-gray-500">{task.assignee}</p>
                        <p className="text-xs text-gray-400">
                          Due {task.dueDate}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <span className="font-medium">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="capitalize">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.section}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <div>View mode not supported yet</div>;
};

export default ProjectBoardContent;
