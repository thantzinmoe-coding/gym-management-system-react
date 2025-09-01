import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNotifications } from "@/context/NotificationContext";

export default function ViewNotifications() {
  const { notifications, markAllAsRead } = useNotifications();

  useEffect(() => {
    markAllAsRead(); // mark all as read on page load
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Review notifications for all members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No notifications
                  </TableCell>
                </TableRow>
              )}
              {notifications.map(n => (
                <TableRow key={n.id}>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{n.message}</TableCell>
                  <TableCell>{n.recipient}</TableCell>
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
