import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Teams = () => {
  // Mock team data - will be replaced with actual API data
  const teams = [
    {
      id: 1,
      name: 'Engineering',
      description: 'Development and technical team',
      memberCount: 12,
      color: 'bg-blue-500',
    },
    {
      id: 2,
      name: 'Design',
      description: 'UI/UX and creative team',
      memberCount: 5,
      color: 'bg-purple-500',
    },
    {
      id: 3,
      name: 'Marketing',
      description: 'Marketing and content team',
      memberCount: 8,
      color: 'bg-green-500',
    },
  ];

  const teamMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', initials: 'JD' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member', initials: 'JS' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Member', initials: 'BW' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Member', initials: 'AB' },
  ];

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
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>

        {/* Teams Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white ${team.color}`}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {team.memberCount} members
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Members */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Team Members</h3>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                      {member.role === 'Admin' && <Crown className="h-3 w-3 mr-1" />}
                      {member.role}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Settings
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder Notice */}
        <Card className="border-dashed border-2">
          <CardContent className="p-8">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="font-semibold text-lg">Teams (UI Placeholder)</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                This is a placeholder UI. Full team management functionality including
                team creation, member management, and permissions will be implemented in future updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Teams;
