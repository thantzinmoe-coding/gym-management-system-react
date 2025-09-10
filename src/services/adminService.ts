// src/services/superAdminService.ts
import api from '@/services/api';

const superAdminUrl = '/api/v1/super_admin';

export const superAdminService = {
    // Delete user
    deleteUser: async (id: number) => {
        try {
            const response = await api.delete(`${superAdminUrl}/user/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error.response?.data || { message: 'Failed to delete user' };
        }
    },

    // Get all users (paginated, with filters)
    getAllUsers: async (params: {
        keyword?: string;
        role?: string;
        status?: string;
        page?: number;
        size?: number;
    }) => {
        try {
            const response = await api.get(`${superAdminUrl}/all-users`, { params });
            return response.data;
        } catch (error) {
            console.error('Get all users error:', error);
            throw error.response?.data || { message: 'Failed to fetch users' };
        }
    },

    // Accept booking
    acceptBooking: async (bookingId: number) => {
        try {
            const response = await api.post(`${superAdminUrl}/${bookingId}`);
            return response.data;
        } catch (error) {
            console.error('Accept booking error:', error);
            throw error.response?.data || { message: 'Failed to accept booking' };
        }
    },

    // Get all bookings (paginated, with filters)
    getAllBookings: async (params: {
        keyword?: string;
        memberId?: number;
        packageId?: number;
        memberStatus?: string;
        page?: number;
        size?: number;
    }) => {
        try {
            const response = await api.get(`${superAdminUrl}/get-all-bookings`, { params });
            return response.data;
        } catch (error) {
            console.error('Get all bookings error:', error);
            throw error.response?.data || { message: 'Failed to fetch bookings' };
        }
    },

    //Get all pending bookings
    getAllPendingBookings: async (params: {
        keyword?: string;
        memberId?: number;
        packageId?: number;
        memberStatus?: string;
        page?: number;
        size?: number;
    }) => {
        try {
            const response = await api.get(`${superAdminUrl}/get-all-pending-bookings`, { params });
            return response.data;
        } catch (error) {
            console.error('Get all pending bookings error:', error);
            throw error.response?.data || { message: 'Failed to fetch pending bookings' };
        }
    },

    // Accept trainer
    acceptTrainer: async (trainerId: number, trainerStatus: string) => {
        try {
            const response = await api.patch(
                `${superAdminUrl}/accept-trainer/${trainerId}`,
                trainerStatus,
                {
                    headers: { 'Content-Type': 'text/plain' }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Accept trainer error:', error);
            throw error.response?.data || { message: 'Failed to accept trainer' };
        }
    },

    rejectTrainer: async (trainerId: number) => {
        try {
            const response = await api.patch(`${superAdminUrl}/reject-trainer-application/${trainerId}`);
            return response.data;
        } catch (error) {
            console.error('Reject trainer error:', error);
            throw error.response?.data || { message: 'Failed to reject trainer' };
        }
    },

    approveMemberBooking: async (bookingId: NumberConstructor) => {
        try {
            const response = await api.patch(`${superAdminUrl}/${bookingId}`);
            return response.data;
        } catch (error) {
            console.error('Accept member error:', error);
            throw error.response?.data || { message: 'Failed to accept member' };
        }
    },

    rejectMemberBooking: async (bookingId: NumberConstructor,
        email: string, packageName: string, name: string
    ) => {
        try {
            const response = await api.delete(`${superAdminUrl}/reject-member-booking/${bookingId}`, {
                data: { email, packageName, name }
            });
            return response.data;
        } catch (error) {
            console.error('Reject member error:', error);
            throw error.response?.data || { message: 'Failed to reject member' };
        }
    },

    // Get all trainers
    getAllTrainers: async (params: { page?: number; size?: number }) => {
        try {
            const response = await api.get(`${superAdminUrl}/all-trainers`, { params });
            return response.data;
        } catch (error) {
            console.error('Get all trainers error:', error);
            throw error.response?.data || { message: 'Failed to fetch trainers' };
        }
    },

    // Get all active trainers
    getAllActiveTrainers: async (params: { page?: number; size?: number }) => {
        try {
            const response = await api.get(`${superAdminUrl}/all-active-trainers`, { params });
            return response.data;
        } catch (error) {
            console.error('Get all active trainers error:', error);
            throw error.response?.data || { message: 'Failed to fetch active trainers' };
        }
    },

    // Get all available trainers
    getAllAvailableTrainers: async (params: { page?: number; size?: number }) => {
        try {
            const response = await api.get(`${superAdminUrl}/all-available-trainers`, { params });
            return response.data;
        } catch (error) {
            console.error('Get all available trainers error:', error);
            throw error.response?.data || { message: 'Failed to fetch available trainers' };
        }
    }
};
