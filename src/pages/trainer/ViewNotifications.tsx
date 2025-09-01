import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";

export default function ViewNotifications() {
  const { notifications, markAllAsRead } = useNotifications();
  const { user } = useAuth();

  const userRecipient = user?.role === 'trainer' ? 'All Trainers' : 'All Members';
  
  useEffect(() => {
    markAllAsRead(userRecipient); // mark all notifications for this role as read
  }, []);

  const filteredNotifications = notifications.filter(n => n.recipient === userRecipient);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Review notifications for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No notifications
                  </TableCell>
                </TableRow>
              )}
              {filteredNotifications.map(n => (
                <TableRow key={n.id}>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{n.message}</TableCell>
                  <TableCell>{n.sentAt}</TableCell>
                  <TableCell>
                    {n.read ? (
                      <span className="text-green-600 font-medium">Read</span>
                    ) : (
                      <span className="text-red-600 font-medium">Unread</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
