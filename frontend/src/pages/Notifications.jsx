import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  AlertCircle,
  Calendar,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Notifications = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'task',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      title: 'Task completed',
      message: 'John Doe completed "Design homepage mockup"',
      time: '2 hours ago',
      read: false,
      project: 'Website Redesign',
    },
    {
      id: 2,
      type: 'comment',
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'New comment',
      message: 'Jane Smith commented on your task "API Development"',
      time: '4 hours ago',
      read: false,
      project: 'Backend API',
    },
    {
      id: 3,
      type: 'invite',
      icon: UserPlus,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Team invitation',
      message: 'You were added to the "Marketing" team',
      time: '5 hours ago',
      read: true,
      project: 'Marketing Campaign',
    },
    {
      id: 4,
      type: 'deadline',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      title: 'Deadline approaching',
      message: 'Task "Mobile app release" is due in 2 days',
      time: '1 day ago',
      read: false,
      project: 'Mobile App',
    },
    {
      id: 5,
      type: 'meeting',
      icon: Calendar,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      title: 'Meeting scheduled',
      message: 'Team standup scheduled for tomorrow at 10:00 AM',
      time: '1 day ago',
      read: true,
      project: 'General',
    },
    {
      id: 6,
      type: 'task',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      title: 'Task assigned',
      message: 'Bob Wilson assigned you to "Update documentation"',
      time: '2 days ago',
      read: true,
      project: 'Documentation',
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    console.log('Mark all as read');
    // TODO: Implement mark all as read
  };

  const handleClearAll = () => {
    console.log('Clear all notifications');
    // TODO: Implement clear all
  };

  const NotificationItem = ({ notification }) => (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
        notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
      )}
    >
      <div className={cn('h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0', notification.iconBg)}>
        <notification.icon className={cn('h-5 w-5', notification.iconColor)} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-sm">{notification.title}</p>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          </div>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{notification.time}</span>
          <span>•</span>
          <span className="text-primary font-medium">{notification.project}</span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Mark as read
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unread') return !notification.read;
    return notification.type === selectedTab;
  });

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="default" className="rounded-full">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Stay updated with your team's activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
            <TabsTrigger value="comment">Comments</TabsTrigger>
            <TabsTrigger value="invite">Invites</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-3 mt-6">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bell className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No notifications</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        You're all caught up! Check back later for updates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Placeholder Notice */}
        <Card className="border-dashed border-2">
          <CardContent className="p-8">
            <div className="text-center space-y-2">
              <Bell className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="font-semibold text-lg">Notifications (UI Placeholder)</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                This is a placeholder UI with mock notifications. Real-time notifications,
                push updates, and notification preferences will be implemented with backend integration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Notifications;
