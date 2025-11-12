import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, Settings, Crown, Trash2, Edit2, Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { teamsService } from '../services/api/teams.service';
import { toast } from 'sonner';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', color: '#3b82f6' });
  const [editTeam, setEditTeam] = useState({ name: '', description: '', color: '' });
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);

  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
    { value: '#06b6d4', label: 'Cyan' },
  ];

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (addMemberDialogOpen && selectedTeam) {
      fetchAvailableMembers(selectedTeam.id);
    }
  }, [addMemberDialogOpen, selectedTeam]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsService.getAll();
      setTeams(response.data || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      const response = await teamsService.getMembers(teamId);
      setTeamMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const fetchAvailableMembers = async (teamId) => {
    try {
      const response = await teamsService.getAvailableMembers(teamId);
      setAvailableMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch available members:', error);
      toast.error('Failed to load available members');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      await teamsService.create(newTeam);
      toast.success('Team created successfully');
      setCreateDialogOpen(false);
      setNewTeam({ name: '', description: '', color: '#3b82f6' });
      fetchTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editTeam.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      await teamsService.update(selectedTeam.id, editTeam);
      toast.success('Team updated successfully');
      setEditDialogOpen(false);
      if (selectedTeam) {
        setSelectedTeam({ ...selectedTeam, ...editTeam });
      }
      fetchTeams();
    } catch (error) {
      console.error('Failed to update team:', error);
      toast.error(error.response?.data?.message || 'Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await teamsService.delete(teamId);
      toast.success('Team deleted successfully');
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
        setTeamMembers([]);
      }
      fetchTeams();
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error('Please select a member');
      return;
    }

    try {
      await teamsService.addMember(selectedTeam.id, {
        userId: selectedMemberId,
        role: newMemberRole,
      });
      toast.success('Member added successfully');
      setAddMemberDialogOpen(false);
      setSelectedMemberId('');
      setNewMemberRole('MEMBER');
      fetchTeamMembers(selectedTeam.id);
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      await teamsService.updateMemberRole(selectedTeam.id, memberId, newRole);
      toast.success('Member role updated');
      fetchTeamMembers(selectedTeam.id);
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    const confirmed = window.confirm(`Remove ${memberName} from the team?`);
    if (!confirmed) return;

    try {
      await teamsService.removeMember(selectedTeam.id, memberId);
      toast.success('Member removed successfully');
      fetchTeamMembers(selectedTeam.id);
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const openEditDialog = (team) => {
    setSelectedTeam(team);
    setEditTeam({
      name: team.name,
      description: team.description || '',
      color: team.color || '#3b82f6',
    });
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading teams...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your teams and collaborate with members
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <Users className="h-16 w-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">No teams yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Get started by creating your first team
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {teams.map((team) => (
              <Card
                key={team.id}
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedTeam?.id === team.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTeam(team)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: team.color || '#3b82f6' }}
                      >
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{team.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{team.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {team._count?.members || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(team);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeam(team.id, team.name);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Team Members Section */}
        {selectedTeam && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {selectedTeam.name} - Members
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddMemberDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
              <div className="space-y-3">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No members yet</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user?.avatarUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{member.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => handleUpdateMemberRole(member.id, newRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3 w-3" />
                                Admin
                              </div>
                            </SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveMember(member.id, member.user?.fullName || member.user?.email)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Team Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Create a team to collaborate with your workspace members</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name *</label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g., Engineering, Design, Marketing"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="What is this team for?"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Select value={newTeam.color} onValueChange={(color) => setNewTeam({ ...newTeam, color })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: option.value }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Team</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Team Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>Update team information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name *</label>
                <Input
                  value={editTeam.name}
                  onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })}
                  placeholder="Team name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editTeam.description}
                  onChange={(e) => setEditTeam({ ...editTeam, description: e.target.value })}
                  placeholder="Team description"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Select value={editTeam.color} onValueChange={(color) => setEditTeam({ ...editTeam, color })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: option.value }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add an existing workspace member to this team. To invite new members to the workspace, go to the Members page.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Member *</label>
                <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={memberSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedMemberId
                        ? availableMembers.find((m) => m.id === selectedMemberId)?.fullName ||
                          availableMembers.find((m) => m.id === selectedMemberId)?.email
                        : 'Select member...'}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search workspace members..." />
                      <CommandEmpty>
                        {availableMembers.length === 0
                          ? 'All workspace members are already in this team'
                          : 'No member found'}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {availableMembers.map((member) => (
                            <CommandItem
                              key={member.id}
                              value={member.fullName || member.email}
                              onSelect={() => {
                                setSelectedMemberId(member.id);
                                setMemberSearchOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member.avatarUrl} />
                                  <AvatarFallback>
                                    {member.fullName?.charAt(0) || member.email?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {member.fullName || member.email}
                                  </span>
                                  {member.fullName && (
                                    <span className="text-xs text-muted-foreground">{member.email}</span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Crown className="h-3 w-3" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedMemberId}>
                  Add Member
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Teams;
