import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderKanban,
  MoreVertical,
  Star,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Grid3x3,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Projects = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock projects data - replace with actual data from API/context
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
      status: 'active',
      color: 'bg-blue-500',
      members: [
        { id: 1, name: 'John Doe', initials: 'JD' },
        { id: 2, name: 'Jane Smith', initials: 'JS' },
        { id: 3, name: 'Bob Wilson', initials: 'BW' },
      ],
      tasksCompleted: 12,
      tasksTotal: 24,
      dueDate: '2024-03-15',
      isFavorite: true,
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android',
      status: 'active',
      color: 'bg-purple-500',
      members: [
        { id: 4, name: 'Alice Brown', initials: 'AB' },
        { id: 5, name: 'Charlie Davis', initials: 'CD' },
      ],
      tasksCompleted: 8,
      tasksTotal: 16,
      dueDate: '2024-04-20',
      isFavorite: false,
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      description: 'Q2 marketing campaign for product launch',
      status: 'planning',
      color: 'bg-green-500',
      members: [
        { id: 6, name: 'Eve Martinez', initials: 'EM' },
      ],
      tasksCompleted: 3,
      tasksTotal: 10,
      dueDate: '2024-05-01',
      isFavorite: true,
    },
    {
      id: 4,
      name: 'API Development',
      description: 'RESTful API for customer portal',
      status: 'paused',
      color: 'bg-orange-500',
      members: [
        { id: 7, name: 'Frank Thomas', initials: 'FT' },
        { id: 8, name: 'Grace Lee', initials: 'GL' },
      ],
      tasksCompleted: 15,
      tasksTotal: 20,
      dueDate: '2024-03-30',
      isFavorite: false,
    },
    {
      id: 5,
      name: 'Customer Portal',
      description: 'Self-service portal for customer support',
      status: 'completed',
      color: 'bg-cyan-500',
      members: [
        { id: 9, name: 'Henry Kim', initials: 'HK' },
      ],
      tasksCompleted: 18,
      tasksTotal: 18,
      dueDate: '2024-02-28',
      isFavorite: false,
    },
    {
      id: 6,
      name: 'Analytics Dashboard',
      description: 'Internal analytics and reporting dashboard',
      status: 'active',
      color: 'bg-pink-500',
      members: [
        { id: 10, name: 'Isabel Chen', initials: 'IC' },
        { id: 11, name: 'Jack Ryan', initials: 'JR' },
        { id: 12, name: 'Kate Wilson', initials: 'KW' },
      ],
      tasksCompleted: 7,
      tasksTotal: 14,
      dueDate: '2024-04-10',
      isFavorite: true,
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default', color: 'bg-green-500' },
      paused: { label: 'Paused', variant: 'secondary', color: 'bg-yellow-500' },
      planning: { label: 'Planning', variant: 'outline', color: 'bg-purple-500' },
      completed: { label: 'Completed', variant: 'secondary', color: 'bg-blue-500' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge variant={config.variant} className="gap-1">
        <div className={cn('h-2 w-2 rounded-full', config.color)} />
        {config.label}
      </Badge>
    );
  };

  const ProjectCard = ({ project }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-white', project.color)}>
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                {project.isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
              </div>
              <CardDescription className="line-clamp-2 mt-1">
                {project.description}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Toggle Favorite</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          {getStatusBadge(project.status)}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {project.dueDate}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">
              {project.tasksCompleted}/{project.tasksTotal} tasks
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${(project.tasksCompleted / project.tasksTotal) * 100}%` }}
            />
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center -space-x-2">
            {project.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="h-7 w-7 border-2 border-white">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          <Link to={`/project-board/${project.id}/list`}>
            <Button size="sm" variant="outline">
              Open
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectListItem = ({ project }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-white flex-shrink-0', project.color)}>
            <FolderKanban className="h-5 w-5" />
          </div>

          {/* Name & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{project.name}</h3>
              {project.isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
            </div>
            <p className="text-sm text-gray-500 truncate">{project.description}</p>
          </div>

          {/* Status */}
          <div className="hidden md:block">
            {getStatusBadge(project.status)}
          </div>

          {/* Progress */}
          <div className="hidden lg:block w-32">
            <div className="text-xs text-gray-500 mb-1">
              {project.tasksCompleted}/{project.tasksTotal} tasks
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${(project.tasksCompleted / project.tasksTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Members */}
          <div className="hidden xl:flex items-center -space-x-2">
            {project.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="h-7 w-7 border-2 border-white">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs">
                +{project.members.length - 3}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to={`/project-board/${project.id}/list`}>
              <Button size="sm" variant="outline">
                Open
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem>Toggle Favorite</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and organize all your projects in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center rounded-lg border bg-white p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Projects</CardDescription>
              <CardTitle className="text-3xl">{projects.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl">
                {projects.filter((p) => p.status === 'active').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {projects.filter((p) => p.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Favorites</CardDescription>
              <CardTitle className="text-3xl">
                {projects.filter((p) => p.isFavorite).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Projects;
