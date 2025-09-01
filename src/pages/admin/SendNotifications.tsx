// /src/pages/admin/SendNotifications.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bell, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, RecipientType, Notification } from "@/context/NotificationContext";

export default function SendNotifications() {
  const { toast } = useToast();
  const { notifications, addNotification } = useNotifications();

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

    addNotification(notification as Omit<Notification, "id" | "sentAt">);

    toast({
      title: "Notification Sent",
      description: `Notification sent to ${notification.recipient}`,
    });

    setNotification({ title: "", message: "", recipient: "" });
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notifications
            </CardTitle>
            <CardDescription>View recently sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground">{notif.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {notif.recipient}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {notif.sentAt}
                      </div>
                    </div>
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
