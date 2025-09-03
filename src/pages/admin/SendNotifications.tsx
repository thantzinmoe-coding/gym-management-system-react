import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bell, Clock, Users, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, RecipientType, Notification } from "@/context/NotificationContext";

export default function SendNotifications() {
  const { toast } = useToast();
  const { notifications, addNotification, deleteNotification } = useNotifications();

  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    recipient: RecipientType | "";
  }>({ title: "", message: "", recipient: "" });

  const handleSendNotification = () => {
    if (!notification.title || !notification.message || !notification.recipient) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }

    addNotification(notification as Omit<Notification, "id" | "sentAt" | "read">);

    toast({
      title: "Notification Sent",
      description: `Notification sent to ${notification.recipient}`,
    });

    setNotification({ title: "", message: "", recipient: "" });
  };

  const handleDeleteNotification = (id: number) => {
    deleteNotification(id);
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Send Notifications</h1>
        <p className="text-muted-foreground">Send notifications to members and trainers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Compose Notification
            </CardTitle>
            <CardDescription>Create and send notifications to your gym community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                value={notification.title}
                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notification.message}
                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="recipient">Send To</Label>
              <Select
                value={notification.recipient}
                onValueChange={(value) =>
                  setNotification({ ...notification, recipient: value as RecipientType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Members">All Members</SelectItem>
                  <SelectItem value="All Trainers">All Trainers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSendNotification} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="bg-gray-800 border-2 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Bell className="h-5 w-5 mr-2 text-white" />
              Recent Notifications
            </CardTitle>
            <CardDescription className="text-gray-300">View recently sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-300">No notifications sent yet.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 bg-gray-600 border-2 border-gray-600 rounded-lg relative">
                    <h4 className="font-medium text-white">{notif.title}</h4>
                    <p className="text-sm text-gray-200 mb-3">{notif.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1 text-gray-400" />
                        {notif.recipient}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {notif.sentAt}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 flex items-center gap-1"
                      onClick={() => handleDeleteNotification(notif.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
