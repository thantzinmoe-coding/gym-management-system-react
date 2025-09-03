import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNotifications } from "@/context/NotificationContext";

export default function ViewNotifications() {
  const { notifications, markAllAsRead } = useNotifications();
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    markAllAsRead(); // mark all as read on page load
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const truncateText = (text, length = 50) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-black">Notifications</h1>
      <Card className="bg-gray-100">
        <CardHeader>
          <CardTitle className="text-black">All Notifications</CardTitle>
          <CardDescription className="text-black">Review notifications for all members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-200">
                <TableHead className="text-black font-bold">Title</TableHead>
                <TableHead className="text-black font-bold">Message</TableHead>
                <TableHead className="text-black font-bold">Recipient</TableHead>
                <TableHead className="text-black font-bold">Sent At</TableHead>
                <TableHead className="text-black font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-black">
                    No notifications
                  </TableCell>
                </TableRow>
              )}
              {notifications.map(n => {
                const isExpanded = expandedIds.includes(n.id);
                return (
                  <TableRow key={n.id} className="bg-gray-100 hover:bg-gray-200">
                    <TableCell className="text-black font-medium">{n.title}</TableCell>
                    <TableCell className="text-black">
                      {isExpanded ? n.message : truncateText(n.message, 50)}
                      {n.message.length > 50 && (
                        <button
                          onClick={() => toggleExpand(n.id)}
                          className="ml-2 text-blue-600 underline"
                        >
                          {isExpanded ? "Less" : "More"}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-black">{n.recipient}</TableCell>
                    <TableCell className="text-black">{n.sentAt}</TableCell>
                    <TableCell>
                      {n.read ? (
                        <span className="text-green-600 font-medium">Read</span>
                      ) : (
                        <span className="text-red-600 font-medium">Unread</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
