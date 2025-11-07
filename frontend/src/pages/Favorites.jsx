import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Calendar,
  Grid3x3,
  List,
  Heart,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectsService } from '../services/api/projects.service';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch projects from API and filter favorites
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsService.getAll();
        if (response.data) {
          // Filter only favorite projects
          const favoriteProjects = response.data.filter((project) => project.isFavorite);
          setProjects(favoriteProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  const getProjectColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      cyan: 'bg-cyan-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project-board/${user?.id}/${projectId}/list`);
  };

  const ProjectCard = ({ project }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => handleProjectClick(project.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-white', getProjectColorClass(project.color))}>
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              </div>
              <CardDescription className="line-clamp-2 mt-1">
                {project.description}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Remove from Favorites</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          {getStatusBadge(project.status)}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {project.dueDate || 'No due date'}
          </span>
        </div>

        {project.tasksTotal > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">
                {project.tasksCompleted || 0}/{project.tasksTotal} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${((project.tasksCompleted || 0) / project.tasksTotal) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {project.members && project.members.length > 0 && (
            <div className="flex items-center -space-x-2">
              {project.members.slice(0, 3).map((member, index) => (
                <Avatar key={index} className="h-7 w-7 border-2 border-white">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {member.initials || member.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
          )}
          <Button size="sm" variant="outline" onClick={(e) => {
            e.stopPropagation();
            handleProjectClick(project.id);
          }}>
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectListItem = ({ project }) => (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => handleProjectClick(project.id)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-white flex-shrink-0', getProjectColorClass(project.color))}>
            <FolderKanban className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{project.name}</h3>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500 truncate">{project.description}</p>
          </div>

          <div className="hidden md:block">
            {getStatusBadge(project.status)}
          </div>

          {project.tasksTotal > 0 && (
            <div className="hidden lg:block w-32">
              <div className="text-xs text-gray-500 mb-1">
                {project.tasksCompleted || 0}/{project.tasksTotal} tasks
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${((project.tasksCompleted || 0) / project.tasksTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          {project.members && project.members.length > 0 && (
            <div className="hidden xl:flex items-center -space-x-2">
              {project.members.slice(0, 3).map((member, index) => (
                <Avatar key={index} className="h-7 w-7 border-2 border-white">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {member.initials || member.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={(e) => {
              e.stopPropagation();
              handleProjectClick(project.id);
            }}>
              Open
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem>Remove from Favorites</DropdownMenuItem>
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
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-red-500 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">Favorite Projects</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quick access to your most important projects
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-sm text-gray-500">Loading favorites...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Star className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">No favorite projects yet</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Star your important projects to see them here
                </p>
              </div>
              <Link to="/projects">
                <Button>Browse Projects</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
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
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Favorites;
