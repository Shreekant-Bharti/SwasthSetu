import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, ArrowRight, RefreshCw, X, FileText, AlertTriangle } from "lucide-react";
import { getNotifications, markNotificationRead, PatientNotification } from "@/lib/localStorage";

interface NotificationsPanelProps {
  userId: string;
}

const NotificationsPanel = ({ userId }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);

  useEffect(() => {
    const loadNotifications = () => {
      const userNotifications = getNotifications(userId);
      setNotifications(userNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      case 'reschedule':
        return <RefreshCw className="h-4 w-4 text-orange-600" />;
      case 'cancel':
        return <X className="h-4 w-4 text-red-600" />;
      case 'prescription':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'referral':
        return <AlertTriangle className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-muted/30';
    switch (type) {
      case 'transfer':
        return 'bg-blue-50 border-blue-200';
      case 'reschedule':
        return 'bg-orange-50 border-orange-200';
      case 'cancel':
        return 'bg-red-50 border-red-200';
      case 'prescription':
        return 'bg-green-50 border-green-200';
      case 'referral':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-primary/5';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) return null;

  return (
    <Card className="shadow-lg border-2 border-primary/20 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-red-500">{unreadCount} new</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-2 transition-all ${getBgColor(notification.type, notification.read)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(notification.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;