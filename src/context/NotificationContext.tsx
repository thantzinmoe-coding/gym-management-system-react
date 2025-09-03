import React, { createContext, useContext, useState, ReactNode } from "react";

export type RecipientType = "All Members" | "All Trainers";

export interface Notification {
  id: number;
  title: string;
  message: string;
  recipient: RecipientType;
  sentAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, "id" | "sentAt" | "read">) => void;
  deleteNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: (recipient?: RecipientType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notif: Omit<Notification, "id" | "sentAt" | "read">) => {
    const newNotif: Notification = {
      id: notifications.length + 1,
      sentAt: new Date().toLocaleString(),
      read: false,
      ...notif,
    };
    setNotifications([newNotif, ...notifications]);
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = (recipient?: RecipientType) => {
    setNotifications((prev) =>
      prev.map((n) =>
        recipient ? (n.recipient === recipient ? { ...n, read: true } : n) : { ...n, read: true }
      )
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, deleteNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
