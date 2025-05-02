
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Notification } from "@/contexts/NotificationContext";

interface NotificationsTabProps {
  notifications: Notification[];
  searchNotifications: string;
  setSearchNotifications: (value: string) => void;
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  searchNotifications,
  setSearchNotifications,
  markAsRead,
  clearNotification,
}) => {
  const filteredNotifications = notifications.filter(notification => 
    ((notification.metadata?.userId || "").toLowerCase().includes(searchNotifications.toLowerCase()) || 
     (notification.metadata?.userFullName || "").toLowerCase().includes(searchNotifications.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Notifications</CardTitle>
        <CardDescription>
          View and manage all system notifications
        </CardDescription>
        <div className="mt-2">
          <Input
            placeholder="Search by ID number or name..."
            value={searchNotifications}
            onChange={(e) => setSearchNotifications(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No notifications in the system</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
