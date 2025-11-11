import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import axiosInstance from '../api/axios.instance';

const WorkspaceCreate = () => {
  const navigate = useNavigate();
  const { refreshWorkspaces } = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();

    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    try {
      setLoading(true);
      // Call the onboarding endpoint to create workspace
      const response = await axiosInstance.post('/auth/onboarding/workspace', {
        name: workspaceName.trim(),
      });

      toast.success('Workspace created successfully');

      // Refresh workspaces list
      await refreshWorkspaces();

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Workspace</h1>
                <p className="text-sm text-gray-600">Set up a new workspace for your team</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Details</CardTitle>
              <CardDescription>
                A workspace is where your team collaborates on projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">
                    Workspace Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="workspaceName"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. My Company, Acme Inc"
                    disabled={loading}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500">
                    Choose a name that represents your organization or team
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!workspaceName.trim() || loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Workspace'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkspaceCreate;
