// /src/services/notificationService.ts
import api from "@/services/api";

const notificationUrl = "/api/v1/notifications";

export const notificationService = {
  sendNotification: async (notificationData: { title: string; message: string; role: string }) => {
    const response = await api.post(`${notificationUrl}/send`, {
      title: notificationData.title,
      content: notificationData.message,
      role: notificationData.role,
    });
    return response.data;
  },

  getForUser: async (userId: number) => {
    const response = await api.get(`${notificationUrl}/${userId}`);
    console.log("Fetched notifications:", response.data);
    return response.data; // should be an array of notifications
  },

  markAsRead: async (notificationId: number) => {
    const response = await api.post(`${notificationUrl}/${notificationId}/read`);
    return response.data;
  },
};
