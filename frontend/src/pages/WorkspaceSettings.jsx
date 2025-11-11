import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Settings as SettingsIcon, Save, ArrowLeft, Mail, UserPlus, Trash2, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { tenantsService } from '@/services/api';

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const { currentWorkspace, refreshCurrentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // General Settings State
  const [workspaceName, setWorkspaceName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Invite Member State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  // Load workspace data
  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name || '');
    }
  }, [currentWorkspace]);

  // Fetch members when Members tab is active
  useEffect(() => {
    if (activeTab === 'members' && currentWorkspace?.id) {
      fetchMembers();
    }
  }, [activeTab, currentWorkspace?.id]);

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await tenantsService.getMembers(currentWorkspace.id);
      const membersData = response?.data?.data?.members || [];
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleNameChange = (value) => {
    setWorkspaceName(value);
    setHasChanges(value !== currentWorkspace?.name);
  };

  const handleSaveSettings = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      await tenantsService.updateSettings(currentWorkspace.id, {
        name: workspaceName.trim(),
      });
      toast.success('Workspace settings updated successfully');
      setHasChanges(false);
      refreshCurrentWorkspace();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast.error('Failed to update workspace settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsInviting(true);
      await tenantsService.inviteMembers(currentWorkspace.id, {
        emails: [inviteEmail],
        role: inviteRole,
      });
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      setInviteRole('MEMBER');
      fetchMembers(); // Refresh members list
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      await tenantsService.updateMemberRole(currentWorkspace.id, userId, newRole);
      toast.success('Member role updated');
      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    const confirmed = window.confirm(`Remove ${memberName} from the workspace?`);
    if (!confirmed) return;

    try {
      await tenantsService.removeMember(currentWorkspace.id, userId);
      toast.success('Member removed successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const isAdmin = currentWorkspace?.userRole === 'TENANT_ADMIN';

  if (!currentWorkspace) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No workspace selected</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
                <p className="text-sm text-gray-600">{currentWorkspace.name}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="general">
                <SettingsIcon className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Information</CardTitle>
                  <CardDescription>
                    Update your workspace name and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspaceName">Workspace Name</Label>
                    <Input
                      id="workspaceName"
                      value={workspaceName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="My Workspace"
                      disabled={!isAdmin || loading}
                    />
                    {!isAdmin && (
                      <p className="text-xs text-gray-500">
                        Only workspace admins can change the workspace name
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Workspace ID</Label>
                    <Input
                      value={currentWorkspace.id}
                      disabled
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Your Role</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={isAdmin ? 'default' : 'secondary'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {isAdmin ? 'Admin' : 'Member'}
                      </Badge>
                    </div>
                  </div>

                  {isAdmin && hasChanges && (
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveSettings} disabled={loading}>
                        {loading ? (
                          'Saving...'
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6 mt-6">
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Invite Members</CardTitle>
                    <CardDescription>
                      Add people to your workspace by sending email invitations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleInviteMember} className="flex gap-3">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="pl-10"
                          disabled={isInviting}
                        />
                      </div>
                      <Select value={inviteRole} onValueChange={setInviteRole} disabled={isInviting}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TENANT_ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" disabled={isInviting}>
                        {isInviting ? 'Sending...' : 'Invite'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Workspace Members ({members.length})</CardTitle>
                  <CardDescription>
                    Manage people who have access to this workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : members.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No members yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={member.user?.avatarUrl} alt={member.user?.fullName} />
                              <AvatarFallback>
                                {(member.user?.fullName || member.user?.email || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 truncate">
                                  {member.user?.fullName || member.user?.email}
                                </p>
                                {member.isPending && (
                                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Pending
                                  </Badge>
                                )}
                                {member.userId === currentWorkspace.ownerId && (
                                  <Badge variant="secondary" className="text-xs">
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">{member.user?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAdmin && member.userId !== currentWorkspace.ownerId ? (
                              <Select
                                value={member.role}
                                onValueChange={(newRole) => handleUpdateMemberRole(member.userId, newRole)}
                                disabled={member.isPending}
                              >
                                <SelectTrigger className="w-32 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TENANT_ADMIN">Admin</SelectItem>
                                  <SelectItem value="MEMBER">Member</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="text-sm text-gray-500 w-32 text-center">
                                {member.role === 'TENANT_ADMIN' ? 'Admin' : 'Member'}
                              </div>
                            )}

                            {isAdmin && member.userId !== currentWorkspace.ownerId && !member.isPending && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveMember(member.userId, member.user?.fullName || member.user?.email)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkspaceSettings;
