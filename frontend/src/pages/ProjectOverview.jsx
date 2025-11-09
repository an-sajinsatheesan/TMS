import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  UserPlus,
  UserMinus,
  FolderPlus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { projectsService } from '../services/api/projects.service';
import { toast } from 'sonner';

const ACTIVITY_ICONS = {
  PROJECT_CREATED: FolderPlus,
  PROJECT_UPDATED: FileText,
  PROJECT_STATUS_CHANGED: Activity,
  PROJECT_DELETED: Trash2,
  PROJECT_RESTORED: RefreshCw,
  MEMBER_ADDED: UserPlus,
  MEMBER_REMOVED: UserMinus,
  TASK_CREATED: FileText,
  TASK_UPDATED: FileText,
  TASK_COMPLETED: CheckCircle2,
  TASK_DELETED: XCircle,
  SECTION_CREATED: FolderPlus,
  SECTION_DELETED: Trash2,
};

const ACTIVITY_COLORS = {
  PROJECT_CREATED: 'bg-blue-100 text-blue-600',
  PROJECT_UPDATED: 'bg-blue-100 text-blue-600',
  PROJECT_STATUS_CHANGED: 'bg-purple-100 text-purple-600',
  PROJECT_DELETED: 'bg-red-100 text-red-600',
  PROJECT_RESTORED: 'bg-green-100 text-green-600',
  MEMBER_ADDED: 'bg-green-100 text-green-600',
  MEMBER_REMOVED: 'bg-red-100 text-red-600',
  TASK_CREATED: 'bg-blue-100 text-blue-600',
  TASK_UPDATED: 'bg-blue-100 text-blue-600',
  TASK_COMPLETED: 'bg-green-100 text-green-600',
  TASK_DELETED: 'bg-red-100 text-red-600',
  SECTION_CREATED: 'bg-blue-100 text-blue-600',
  SECTION_DELETED: 'bg-red-100 text-red-600',
};

const ProjectOverview = () => {
  const { projectId } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [projectId]);

  const fetchActivities = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await projectsService.getActivities(projectId, {
        limit: 50,
        offset,
      });
      const { data, pagination } = response.data.data;

      if (offset === 0) {
        setActivities(data);
      } else {
        setActivities(prev => [...prev, ...data]);
      }

      setHasMore(data.length === pagination.limit);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Project Overview</h1>
          </div>
          <p className="text-gray-600">Recent activity and updates</p>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activities.length === 0 ? (
            <div className="text-center py-16">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-500">
                Activity will appear here as changes are made to the project
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] || Activity;
                const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-gray-100 text-gray-600';

                return (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              <span className="font-semibold">
                                {activity.user?.fullName || activity.user?.email || 'Someone'}
                              </span>{' '}
                              <span className="text-gray-700">{activity.description}</span>
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>

                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                            {activity.type === 'PROJECT_STATUS_CHANGED' && (
                              <span>
                                Status changed from{' '}
                                <span className="font-medium">{activity.metadata.oldStatus}</span>
                                {' to '}
                                <span className="font-medium">{activity.metadata.newStatus}</span>
                              </span>
                            )}
                            {activity.type === 'PROJECT_CREATED' && activity.metadata.templateName && (
                              <span>
                                Created from template:{' '}
                                <span className="font-medium">{activity.metadata.templateName}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* User Avatar */}
                      {activity.user && (
                        <div className="flex-shrink-0">
                          {activity.user.avatarUrl ? (
                            <img
                              src={activity.user.avatarUrl}
                              alt={activity.user.fullName || 'User'}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {(activity.user.fullName || activity.user.email || 'U')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && activities.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => fetchActivities(activities.length)}
                disabled={loading}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
