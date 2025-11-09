import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { projectsService } from '../services/api/projects.service';
import { toast } from 'sonner';

const Trash = () => {
  const [trashedProjects, setTrashedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchTrashedProjects();
  }, []);

  const fetchTrashedProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsService.getTrash();
      setTrashedProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trashed projects:', error);
      toast.error('Failed to load trashed projects');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (projectId, projectName) => {
    try {
      setActionLoading(projectId);
      await projectsService.restoreFromTrash(projectId);
      toast.success(`"${projectName}" restored successfully`);
      fetchTrashedProjects();
    } catch (error) {
      console.error('Error restoring project:', error);
      toast.error('Failed to restore project');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (projectId, projectName) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${projectName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(projectId);
      await projectsService.permanentDelete(projectId);
      toast.success(`"${projectName}" permanently deleted`);
      fetchTrashedProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trashed projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
          </div>
          <p className="text-gray-600">
            Projects will be automatically deleted after 30 days in trash
          </p>
        </div>

        {/* Empty State */}
        {trashedProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects in trash
            </h3>
            <p className="text-gray-500">
              Deleted projects will appear here
            </p>
          </div>
        )}

        {/* Trashed Projects Grid */}
        {trashedProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trashedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color || '#3b82f6' }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {project.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {project._count.tasks} tasks · {project._count.members} members
                    </p>
                  </div>
                </div>

                {/* Time Information */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-800 font-medium">
                        {project.daysUntilPermanentDeletion === 0
                          ? 'Deletes today'
                          : `Deletes in ${project.daysUntilPermanentDeletion} ${
                              project.daysUntilPermanentDeletion === 1 ? 'day' : 'days'
                            }`}
                      </p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Deleted on{' '}
                        {new Date(project.deletedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(project.id, project.name)}
                    disabled={actionLoading === project.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        actionLoading === project.id ? 'animate-spin' : ''
                      }`}
                    />
                    <span className="text-sm font-medium">Restore</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(project.id, project.name)}
                    disabled={actionLoading === project.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete Forever</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning Banner */}
        {trashedProjects.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Auto-deletion Policy
                </h4>
                <p className="text-sm text-yellow-800">
                  Projects in trash are automatically and permanently deleted after 30
                  days. Restore projects you want to keep before they're permanently
                  deleted.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;
