import { useState } from 'react';
import { X, Mail, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { projectMembersService } from '@/services/api/projectMembers.service';

const InviteMembersModal = ({ isOpen, onClose, projectId, currentMembers = [], onMembersUpdated }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if already a member
    const alreadyMember = currentMembers.some(
      (member) => member.user?.email?.toLowerCase() === email.toLowerCase()
    );
    if (alreadyMember) {
      toast.error('This user is already a project member');
      return;
    }

    try {
      setIsSubmitting(true);
      await projectMembersService.invite(projectId, { emails: [email], role });
      toast.success('Invitation sent successfully!');
      setEmail('');
      setRole('MEMBER');
      onMembersUpdated?.();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    const confirmed = window.confirm(`Remove ${memberName} from the project?`);
    if (!confirmed) return;

    try {
      await projectMembersService.remove(projectId, memberId);
      toast.success('Member removed successfully');
      onMembersUpdated?.();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await projectMembersService.updateRole(projectId, memberId, { role: newRole });
      toast.success('Member role updated');
      onMembersUpdated?.();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update member role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Invite Team Members</h2>
              <p className="text-sm text-gray-500">Add people to collaborate on this project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Invite Form */}
        <div className="p-6 border-b">
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Invite'}
            </Button>
          </form>
        </div>

        {/* Current Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Project Members ({currentMembers.length})
          </h3>
          <div className="space-y-3">
            {currentMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No members yet</p>
              </div>
            ) : (
              currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={member.user?.avatarUrl} alt={member.user?.fullName || member.user?.email} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {(member.user?.fullName || member.user?.email || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {member.user?.fullName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(newRole) => handleUpdateRole(member.id, newRole)}
                      disabled={member.role === 'OWNER'}
                    >
                      <SelectTrigger className="w-28 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNER">Owner</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>

                    {member.role !== 'OWNER' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveMember(member.id, member.user?.fullName || member.user?.email)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Invited members will receive an email to join the project
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMembersModal;
