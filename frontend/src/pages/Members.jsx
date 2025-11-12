import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { tenantsService } from '../services/api/tenants.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, MoreVertical, Trash2, Mail, Loader2, Crown, Shield, User as UserIcon } from 'lucide-react';
import { toast } from '../hooks/useToast';
import { format } from 'date-fns';

const Members = () => {
  const { currentWorkspace } = useWorkspace();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Determine if current user is tenant admin
  const isTenantAdmin = currentUser?.tenantRole === 'OWNER' || currentUser?.tenantRole === 'ADMIN';

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchMembers();
    }
  }, [currentWorkspace]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await tenantsService.getMembers(currentWorkspace.id);
      const membersData = response?.data?.members || response?.members || [];
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await tenantsService.updateMemberRole(currentWorkspace.id, userId, newRole);
      toast.success('Member role updated successfully');
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    try {
      setInviteLoading(true);
      const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);

      await tenantsService.inviteMembers(currentWorkspace.id, {
        emails,
        role: 'MEMBER'
      });

      toast.success(`Invitation sent to ${emails.length} email(s)`);
      setInviteDialogOpen(false);
      setInviteEmails('');
      fetchMembers(); // Refresh to show pending invitations
    } catch (error) {
      console.error('Error inviting members:', error);
      toast.error('Failed to send invitations');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await tenantsService.removeMember(currentWorkspace.id, memberToDelete.userId);
      toast.success('Member removed successfully');
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'ADMIN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workspace Members</h1>
            <p className="text-muted-foreground">
              Manage members and their roles in {currentWorkspace?.name}
            </p>
          </div>
          {isTenantAdmin && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Members
            </Button>
          )}
        </div>

        {/* Members Table */}
        <div className="rounded-md border bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Projects Access</TableHead>
                  <TableHead>Joined</TableHead>
                  {isTenantAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isTenantAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      {/* Member Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.user?.avatarUrl} alt={member.user?.fullName} />
                            <AvatarFallback>
                              {member.user?.fullName?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.user?.fullName || member.user?.email}
                              {member.userId === currentUser?.id && (
                                <span className="ml-2 text-xs text-gray-500">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                            {member.isPending && (
                              <Badge variant="outline" className="mt-1">
                                <Mail className="mr-1 h-3 w-3" />
                                Pending Invitation
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        {isTenantAdmin && member.role !== 'OWNER' && !member.isPending ? (
                          <Select
                            value={member.role}
                            onValueChange={(newRole) => handleRoleChange(member.userId, newRole)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(member.role)}
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">
                                <div className="flex items-center gap-2">
                                  {getRoleIcon('ADMIN')}
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="MEMBER">
                                <div className="flex items-center gap-2">
                                  {getRoleIcon('MEMBER')}
                                  Member
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1 w-fit">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Projects */}
                      <TableCell>
                        {member.isPending ? (
                          <span className="text-sm text-muted-foreground">No access yet</span>
                        ) : member.projects && member.projects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {member.projects.slice(0, 3).map((project) => (
                              <Badge key={project.id} variant="secondary" className="text-xs">
                                {project.icon && <span className="mr-1">{project.icon}</span>}
                                {project.name}
                              </Badge>
                            ))}
                            {member.projects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{member.projects.length - 3} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No project access</span>
                        )}
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="text-sm text-muted-foreground">
                        {member.isPending ? 'Pending' : format(new Date(member.joinedAt), 'MMM d, yyyy')}
                      </TableCell>

                      {/* Actions */}
                      {isTenantAdmin && (
                        <TableCell className="text-right">
                          {member.role !== 'OWNER' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setMemberToDelete(member);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Info Message for Non-Admins */}
        {!isTenantAdmin && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only workspace owners and admins can invite members and manage roles.
              Project access is managed by project administrators.
            </p>
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Members to Workspace</DialogTitle>
            <DialogDescription>
              Send invitations to new members. They will be added to the workspace but won't have access to any projects until granted by project administrators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <Input
                id="emails"
                placeholder="email1@example.com, email2@example.com"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter one or more email addresses separated by commas
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviteLoading}>
              {inviteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToDelete?.user?.fullName || memberToDelete?.user?.email} from the workspace?
              They will lose access to all projects in this workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Members;
