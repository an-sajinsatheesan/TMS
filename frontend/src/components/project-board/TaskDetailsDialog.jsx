import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { X, Calendar, User, Flag, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { tasksService } from '@/services/api/tasks.service';
import { format } from 'date-fns';

const TaskDetailsDialog = ({ taskId, open, onClose }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetails();
    }
  }, [open, taskId]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const [taskResponse, commentsResponse] = await Promise.all([
        tasksService.getById(taskId),
        tasksService.getComments(taskId),
      ]);

      setTask(taskResponse.data?.data);
      setComments(commentsResponse.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch task details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task && !loading) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on track':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'at risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off track':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold pr-8">
            {loading ? 'Loading...' : task?.title || task?.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading task details...</div>
        ) : task ? (
          <div className="space-y-6">
            {/* Task Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              {task.priority && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Flag className="h-4 w-4" />
                    <span className="font-medium">Priority</span>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              )}

              {/* Status */}
              {task.status && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">Status</span>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </div>
              )}

              {/* Assignee */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Assignee</span>
                </div>
                <div className="text-sm">
                  {task.assignee?.fullName || task.assigneeName || 'Unassigned'}
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Due Date</span>
                </div>
                <div className="text-sm">{formatDate(task.dueDate)}</div>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">
                  Subtasks ({task.subtasks.length})
                </h3>
                <div className="space-y-1">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        readOnly
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{subtask.title || subtask.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">
                Comments ({comments.length})
              </h3>
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {comment.user?.fullName || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

TaskDetailsDialog.propTypes = {
  taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TaskDetailsDialog;
