// src/services/manageUserService.ts
import api from '@/services/api';

const userUrl = 'api/v1/super_admin';
// Relative to baseURL in api.ts

export type Status = 'ACTIVE' | 'INACTIVE';
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

export type BackendUser = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  nrc?: string;
  dob?: string;
  address?: string;
  gender?: string;
  specialization?: string;
  experience?: string;
  role: string; // e.g. MEMBER, TRAINER, ADMIN
  avatarUrl?: string | null;
  status: Status;
  memberStatus?: MemberStatus | null;
  Package?: string | null; // Note: capital P in your DTO
};

export type PaginationMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

export type PaginatedApiResponse<T> = {
  success: number;
  code: number;
  message: string;
  meta: PaginationMeta;
  data: T[];
};

export type ApiResponse = {
  success: number;
  code: number;
  message: string;
  data?: any;
};

export const manageUserService = {
  // Get all users with optional filters and pagination
  getAllUsers: async (
    page: number = 0,
    size: number = 20,
    keyword?: string,
    role?: string, // This parameter is used to filter by role
    status?: string
  ) => {
    try {
      let url = `${userUrl}/all-users?page=${page}&size=${size}`;

      // Add optional query parameters
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (role && role !== 'ALL') url += `&role=${encodeURIComponent(role)}`; // Role filtering happens here
      if (status && status !== 'ALL') url += `&status=${encodeURIComponent(status)}`;

      const response = await api.get(url);
      return response.data; // Returns the entire PaginatedApiResponse
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  // Get users who have booked packages
  getBookedUsers: async (page: number = 0, size: number = 20) => {
    try {
      const response = await api.get(`${userUrl}/booked-users?page=${page}&size=${size}`);
      return response.data; // Returns the entire data object
    } catch (error) {
      console.error('Error fetching booked users:', error);
      throw error.response?.data || { message: 'Failed to fetch booked users' };
    }
  },

  // Delete user by ID
  deleteUser: async (userId: number) => {
    try {
      const response = await api.delete(`${userUrl}/user/delete/${userId}`);
      return response.data; // Returns ApiResponse
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },

  // Accept/Update trainer status (reusing your existing endpoint)
  updateTrainerStatus: async (trainerId: number, status: string) => {
    try {
      const response = await api.patch(
        `${userUrl}/accept-trainer/${trainerId}`,
        status, // just send the string directly
        { headers: { "Content-Type": "text/plain" } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating trainer ${trainerId}:`, error);
      throw error.response?.data || { message: 'Failed to update trainer status' };
    }
  },

  // Accept booking package
  acceptBooking: async (bookingId: number) => {
    try {
      const response = await api.post(`${userUrl}/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error accepting booking ${bookingId}:`, error);
      throw error.response?.data || { message: 'Failed to accept booking' };
    }
  },

  // Get all bookings with filters
  getAllBookings: async (
    page: number = 0,
    size: number = 20,
    keyword?: string,
    memberId?: number,
    packageId?: number,
    memberStatus?: MemberStatus
  ) => {
    try {
      let url = `${userUrl}/get-all-bookings?page=${page}&size=${size}`;

      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (memberId) url += `&memberId=${memberId}`;
      if (packageId) url += `&packageId=${packageId}`;
      if (memberStatus) url += `&memberStatus=${memberStatus}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  // Get all trainers (from your existing endpoints)
  getAllTrainers: async (page: number = 0, size: number = 20) => {
    try {
      const response = await api.get(`${userUrl}/all-trainers?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainers:', error);
      throw error.response?.data || { message: 'Failed to fetch trainers' };
    }
  },

  // Get all active trainers
  getAllActiveTrainers: async (page: number = 0, size: number = 20) => {
    try {
      const response = await api.get(`${userUrl}/all-active-trainers?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active trainers:', error);
      throw error.response?.data || { message: 'Failed to fetch active trainers' };
    }
  },

  // Get all available trainers
  getAllAvailableTrainers: async (page: number = 0, size: number = 20) => {
    try {
      const response = await api.get(`${userUrl}/all-available-trainers?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available trainers:', error);
      throw error.response?.data || { message: 'Failed to fetch available trainers' };
    }
  },
};