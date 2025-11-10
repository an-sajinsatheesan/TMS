import { useState, useEffect } from 'react';
import { invitationService } from '../../api/invitation.service';
import { projectRolesService } from '../../services/api/projectRoles.service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Info, Send, X, Shield, Eye, Users, Crown } from 'lucide-react';
import { toast } from 'sonner';

// Icon mapping for roles fetched from API
const ICON_MAP = {
  Crown,
  Shield,
  Users,
  Eye,
};

export default function InviteDialog({ visible, onHide, projectId, projectName }) {
  const [emails, setEmails] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectRoles, setProjectRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Fetch roles from API when dialog opens
  useEffect(() => {
    const fetchRoles = async () => {
      if (!visible) return;

      try {
        setRolesLoading(true);
        const response = await projectRolesService.getRoles();
        const roles = response?.data?.data || [];
        setProjectRoles(roles);

        // Set default role
        const defaultRole = roles.find(r => r.isDefault);
        if (defaultRole) {
          setSelectedRole(defaultRole.value);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Fallback to hardcoded roles if API fails
        setProjectRoles([
          { value: 'OWNER', label: 'Owner', description: 'Full access', icon: 'Crown' },
          { value: 'ADMIN', label: 'Admin', description: 'Can manage members', icon: 'Shield' },
          { value: 'MEMBER', label: 'Member', description: 'Can create tasks', icon: 'Users', isDefault: true },
          { value: 'VIEWER', label: 'Viewer', description: 'Read only', icon: 'Eye' },
        ]);
        setSelectedRole('MEMBER');
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [visible]);

  const handleInvite = async () => {
    if (!emails.trim()) {
      toast.warning('Please enter at least one email address');
      return;
    }

    const emailList = emails
      .split(/[,\s]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(e => !emailRegex.test(e));

    if (invalidEmails.length > 0) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Send emails with role information
      const invitations = emailList.map(email => ({
        email,
        projectRole: selectedRole
      }));

      await invitationService.sendProjectInvitations(projectId, invitations);
      toast.success('Invitations sent successfully');
      setEmails('');
      setSelectedRole('MEMBER');
      onHide();
    } catch (error) {
      console.error('Error sending invitations:', error);
      setError(error.response?.data?.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Invite to {projectName || 'Project'}</DialogTitle>
          <DialogDescription>
            Invite team members to collaborate
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="emails" className="block text-sm font-medium mb-2">
              Email Addresses
            </Label>
            <Input
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter emails (comma separated)"
              disabled={loading}
            />
            <small className="text-gray-500 block mt-1">
              Separate multiple emails with commas
            </small>
          </div>

          <div>
            <Label htmlFor="role" className="block text-sm font-medium mb-2">
              Role
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading || rolesLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
              </SelectTrigger>
              <SelectContent>
                {projectRoles.map((role) => {
                  const IconComponent = ICON_MAP[role.icon] || Users;
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <small className="text-gray-500 block mt-1">
              {projectRoles.find(r => r.value === selectedRole)?.description}
            </small>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm rounded">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                <ul className="text-blue-800 text-xs space-y-1 ml-4 list-disc">
                  <li>Users will receive email invitations</li>
                  <li>They will join as {projectRoles.find(r => r.value === selectedRole)?.label}s</li>
                  <li>New users will complete their profile before joining</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!emails.trim() || loading}>
            {loading ? 'Sending...' : 'Send Invitations'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
