// /src/context/NotificationContext.tsx
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import client from "@/services/socket"; // STOMP client from socket.ts
import { notificationService } from "@/services/notificationService";
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { toast } from '@/hooks/use-toast';
import { playMessageSound } from '@/utils/notificationSound';
import Cookies from 'js-cookie';

export interface Notification {
  id: number;
  title: string;
  content: string;
  time: string; // matches backend DTO
  isRead: boolean;
}

interface ChatMessage {
  id?: number;
  senderId: number;
  recipientId: number;
  senderName?: string;
  content: string;
  createdAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markAllAsRead: (recipient?: string) => Promise<void>;
  unreadChatCount: number;
  resetChatCount: () => void;
  decrementChatCount: (amount: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const user = authService.getCurrentUser(); // ✅ get logged-in user
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
       setUnreadChatCount(parseInt(localStorage.getItem(`totalUnreadChatCount_${user.id}`) || '0', 10));
    }
  }, [user?.id]);

  // Cache for resolved sender names: { senderId: name }
  const senderNameCacheRef = useRef<Record<number, string>>({});

  const addNotification = (n: Notification) => {
    setNotifications((prev) => [n, ...prev]);
  };

  const markAllAsRead = async () => {
    try {
      const markAsRead = await notificationService.markAllAsRead(user.id);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("❌ Failed to mark notifications as read:", err);
    }
  };

  const resetChatCount = useCallback(() => {
    setUnreadChatCount(0);
    if (user?.id) {
        localStorage.setItem(`totalUnreadChatCount_${user.id}`, '0');
    }
  }, [user?.id]);

  const decrementChatCount = useCallback((amount: number) => {
    setUnreadChatCount(prev => {
      const newCount = Math.max(0, prev - amount);
      if (user?.id) {
          localStorage.setItem(`totalUnreadChatCount_${user.id}`, newCount.toString());
      }
      return newCount;
    });
  }, [user?.id]);

  // Resolve sender name: use cached value, WebSocket payload, or fetch from backend
  const resolveSenderName = useCallback(async (senderId: number, payloadName?: string): Promise<string> => {
    // 1. Use the name from the WebSocket payload if it's meaningful
    if (payloadName && payloadName !== 'Someone') {
      senderNameCacheRef.current[senderId] = payloadName;
      return payloadName;
    }

    // 2. Check cache
    if (senderNameCacheRef.current[senderId]) {
      return senderNameCacheRef.current[senderId];
    }

    // 3. Fetch from backend
    try {
      const profile = await userService.getUserProfile(senderId);
      const name = profile?.name || `User #${senderId}`;
      senderNameCacheRef.current[senderId] = name;
      return name;
    } catch (err) {
      console.warn(`Could not resolve name for sender ${senderId}`, err);
      const fallback = `User #${senderId}`;
      senderNameCacheRef.current[senderId] = fallback;
      return fallback;
    }
  }, []);


  useEffect(() => {
    if (!user?.id) {
      if (client.active) {
        console.log("🔌 Deactivating WebSocket (User logged out)");
        client.deactivate();
      }
      return;
    }

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

    const setupAndActivate = () => {
      client.onConnect = () => {
        console.log("✅ Connected to WebSocket");

        // Subscribe to system notifications (broadcast)
        client.subscribe("/topic/notifications", (message) => {
          const notif: Notification = JSON.parse(message.body);
          console.log("🔔 New notification received:", notif);
          addNotification(notif);
        });

        // Subscribe to private chat messages (user-specific)
        client.subscribe('/user/queue/messages', (message) => {
          const chatMsg: ChatMessage = JSON.parse(message.body);
          console.log("💬 New chat message received (global):", chatMsg);
          window.dispatchEvent(new CustomEvent('chatMessageUpdate', { detail: chatMsg }));

          // Only show notification for messages from others
          if (chatMsg.senderId !== user.id) {
            // Increment global unread chat count
            setUnreadChatCount(prev => {
              const newCount = prev + 1;
              localStorage.setItem(`totalUnreadChatCount_${user.id}`, newCount.toString());
              return newCount;
            });

            // Resolve sender name then show toast
            resolveSenderName(chatMsg.senderId, chatMsg.senderName).then(senderName => {
              const messagePreview = chatMsg.content.length > 60
                ? chatMsg.content.substring(0, 60) + '...'
                : chatMsg.content;

              toast({
                title: `💬 Message from ${senderName}`,
                description: messagePreview,
              });
            });

            playMessageSound();
          }
        });

        // Subscribe to real-time online status updates
        client.subscribe('/topic/online-status', (message) => {
          try {
              const statusMap = JSON.parse(message.body);
              console.log("🟢 Real-time online status received globally:", statusMap);
              window.dispatchEvent(new CustomEvent('onlineStatusUpdate', { detail: statusMap }));
          } catch (e) {
              console.error("Failed to parse online status message", e);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"], frame.body);
      };

      client.beforeConnect = () => {
        const token = Cookies.get('token');
        if (token) {
          client.connectHeaders = {
            Authorization: `Bearer ${token}`,
          };
        }
      };

      client.activate();
    };

    // Reactivate cleanly for the new user
    if (client.active) {
      client.deactivate().then(() => {
        setupAndActivate();
      });
    } else {
      setupAndActivate();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // ✅ runs when user.id changes


  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, unreadChatCount, resetChatCount, decrementChatCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
