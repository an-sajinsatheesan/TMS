import { useState } from 'react';
import { invitationService } from '../../api/invitation.service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Send, X } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteDialog({ visible, onHide, projectId, projectName }) {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      await invitationService.sendProjectInvitations(projectId, emailList);
      toast.success('Invitations sent successfully');
      setEmails('');
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
            <label htmlFor="emails" className="block text-sm font-medium mb-2">
              Email Addresses
            </label>
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

          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm rounded">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                <ul className="text-blue-800 text-xs space-y-1 ml-4 list-disc">
                  <li>Users will receive email invitations</li>
                  <li>They will join after accepting</li>
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
