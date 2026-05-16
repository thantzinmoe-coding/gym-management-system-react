import api from './api';

export const onlineStatusService = {
  /**
   * Check the online status of multiple users.
   * @param userIds Array of user IDs to check
   * @returns A promise that resolves to a record mapping user ID to boolean status
   */
  checkUsersOnlineStatus: async (userIds: number[]): Promise<Record<number, boolean>> => {
    try {
      const response = await api.post<Record<number, boolean>>('/api/v1/online-status/check', userIds);
      return response.data;
    } catch (error) {
      console.error('Error checking online status for users:', error);
      return {};
    }
  },

  /**
   * Check the online status of a single user.
   * @param userId User ID to check
   * @returns A promise that resolves to a boolean indicating if the user is online
   */
  isUserOnline: async (userId: number): Promise<boolean> => {
    try {
      const response = await api.get<{ online: boolean }>(`/api/v1/online-status/${userId}`);
      return response.data.online;
    } catch (error) {
      console.error(`Error checking if user ${userId} is online:`, error);
      return false;
    }
  }
};
