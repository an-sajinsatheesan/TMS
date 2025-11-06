import { useState } from 'react';
import PropTypes from 'prop-types';
import { projectsService } from '../../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CreateProjectModal = ({ visible, onHide, onSuccess }) => {
  const [projectName, setProjectName] = useState('');
  const [layout, setLayout] = useState('BOARD');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setLoading(true);
    try {
      await projectsService.create({ name: projectName, layout });
      toast.success('Project created successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName('');
    setLayout('BOARD');
    onHide();
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium mb-2">
              Project Name *
            </label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Layout</label>
            <Select value={layout} onValueChange={setLayout} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIST">List</SelectItem>
                <SelectItem value="BOARD">Board</SelectItem>
                <SelectItem value="TIMELINE">Timeline</SelectItem>
                <SelectItem value="CALENDAR">Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

CreateProjectModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default CreateProjectModal;
