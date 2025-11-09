import { useState } from 'react';
import PropTypes from 'prop-types';
import { Check, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMembers } from '@/contexts/MembersContext';
import { useAuth } from '@/contexts/AuthContext';

const AssigneeSelect = ({ taskId, currentAssigneeId, currentAssigneeName, currentAssigneeAvatar, onAssigneeChange }) => {
  const [open, setOpen] = useState(false);
  const { users, loading } = useMembers();
  const { user: currentUser } = useAuth();

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSelect = async (userId) => {
    if (onAssigneeChange) {
      await onAssigneeChange(taskId, userId);
    }
    setOpen(false);
  };

  const handleUnassign = async () => {
    if (onAssigneeChange) {
      await onAssigneeChange(taskId, null);
    }
    setOpen(false);
  };

  // If there's a current assignee, show it
  const triggerContent = currentAssigneeName ? (
    <div className="flex items-center gap-2 w-full">
      <Avatar className="h-5 w-5">
        <AvatarImage src={currentAssigneeAvatar} alt={currentAssigneeName} />
        <AvatarFallback className="text-xs">
          {getInitials(currentAssigneeName)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-xs">{currentAssigneeName}</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600">
      <UserPlus className="h-4 w-4" />
      <span className="text-xs">Assign</span>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-gray-100 rounded px-1 py-0 w-full justify-start -mx-2"
        >
          {triggerContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            Assign to
          </div>

          {/* Scrollable user list */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="px-2 py-4 text-xs text-gray-500 text-center">
                Loading members...
              </div>
            ) : users.length === 0 ? (
              <div className="px-2 py-4 text-xs text-gray-500 text-center">
                No members found
              </div>
            ) : (
              <>
                {/* Show current user first as "Me" */}
                {users
                  .sort((a, b) => {
                    if (a.id === currentUser?.id) return -1;
                    if (b.id === currentUser?.id) return 1;
                    return 0;
                  })
                  .map((user, index) => {
                    const isSelected = user.id === currentAssigneeId;
                    const isCurrentUser = user.id === currentUser?.id;
                    const displayName = isCurrentUser && index === 0 ? 'Me' : user.name;

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelect(user.id)}
                        className={cn(
                          'flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-gray-100 transition-colors',
                          isSelected && 'bg-blue-50'
                        )}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs" style={{ backgroundColor: user.color + '20', color: user.color }}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium">{displayName}</div>
                          {user.email && (
                            <div className="text-xs text-gray-500">{user.email}</div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    );
                  })}
              </>
            )}
          </div>

          {/* Unassign option */}
          {currentAssigneeId && (
            <>
              <div className="border-t my-1" />
              <button
                onClick={handleUnassign}
                className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-gray-100 transition-colors text-xs text-gray-600"
              >
                <UserPlus className="h-4 w-4" />
                Unassign
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

AssigneeSelect.propTypes = {
  taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentAssigneeId: PropTypes.string,
  currentAssigneeName: PropTypes.string,
  currentAssigneeAvatar: PropTypes.string,
  onAssigneeChange: PropTypes.func.isRequired,
};

export default AssigneeSelect;
