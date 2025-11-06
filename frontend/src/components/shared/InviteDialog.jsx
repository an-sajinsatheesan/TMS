import { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { invitationService } from '../../api/invitation.service';

export default function InviteDialog({ visible, onHide, projectId, projectName }) {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const handleInvite = async () => {
    if (!emails.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter at least one email address',
        life: 3000
      });
      return;
    }

    // Parse emails (comma or space separated)
    const emailList = emails
      .split(/[,\s]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(e => !emailRegex.test(e));

    if (invalidEmails.length > 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Invalid Email',
        detail: `Invalid email format: ${invalidEmails.join(', ')}`,
        life: 4000
      });
      return;
    }

    setLoading(true);
    try {
      await invitationService.sendProjectInvitations(projectId, emailList);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Invitation${emailList.length > 1 ? 's' : ''} sent to ${emailList.length} email${emailList.length > 1 ? 's' : ''}`,
        life: 3000
      });

      // Reset and close
      setEmails('');
      onHide();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to send invitations',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInvite();
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label="Send Invitations"
        icon="pi pi-send"
        onClick={handleInvite}
        loading={loading}
        disabled={!emails.trim()}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={`Invite to ${projectName || 'Project'}`}
        visible={visible}
        style={{ width: '450px' }}
        onHide={onHide}
        footer={footer}
        draggable={false}
        resizable={false}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="emails" className="block text-sm font-medium mb-2">
              Email Addresses
            </label>
            <InputText
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter email addresses (comma or space separated)"
              className="w-full"
              autoFocus
              disabled={loading}
            />
            <small className="text-gray-500 block mt-1">
              Separate multiple emails with commas or spaces
            </small>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm">
            <div className="flex items-start gap-2">
              <i className="pi pi-info-circle text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                <ul className="text-blue-800 text-xs space-y-1 ml-4 list-disc">
                  <li>Invited users will receive an email invitation</li>
                  <li>They'll join your tenant after accepting</li>
                  <li>They'll have access only to this project</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
