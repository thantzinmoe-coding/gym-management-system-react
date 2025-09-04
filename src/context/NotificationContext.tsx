// /src/context/NotificationContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import client from "@/services/socket"; // STOMP client from socket.ts
import { notificationService } from "@/services/notificationService";
import { authService } from '@/services/authService';

export interface Notification {
  id: number;
  title: string;
  content: string;
  time: string; // matches backend DTO
  read: boolean;
}


interface NotificationContextType {
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markAllAsRead: (recipient?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const user = authService.getCurrentUser(); // ✅ get logged-in user
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (n: Notification) => {
    setNotifications((prev) => [n, ...prev]);
  };

  const markAllAsRead = async () => {
    try {
      const toMark = notifications.filter((n) => !n.read);

      await Promise.all(toMark.map((n) => notificationService.markAsRead(n.id)));

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("❌ Failed to mark notifications as read:", err);
    }
  };


  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        console.log("📥 Fetching notifications for user:", user.id);
        const data = await notificationService.getForUser(user.id);
        if (isMounted) setNotifications(data);
      } catch (err) {
        console.error("❌ Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();

    if (!client.active) { // ✅ only activate if not already active
      client.onConnect = () => {
        console.log("✅ Connected to WebSocket");

        client.subscribe("/topic/notifications", (message) => {
          const notif: Notification = JSON.parse(message.body);
          console.log("🔔 New notification received:", notif);
          addNotification(notif);
        });
      };

      client.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"], frame.body);
      };

      client.activate();
    }

    return () => {
      isMounted = false;
      // ❗ Don't deactivate on every re-render, only on full unmount
      // client.deactivate();
    };
  }, [user?.id]); // ✅ only run when user.id changes


  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
