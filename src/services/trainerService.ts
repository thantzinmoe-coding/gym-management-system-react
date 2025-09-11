// src/services/trainerService.ts
import api from '@/services/api';

const trainerUrl = 'api/v1/super_admin';
const feedbackUrl = 'api/v1/feedback';
// Corrected: Relative to baseURL in api.ts
interface AverageRatingResponse {
    averageRating: number;
}
export interface TrainerResponseDto {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    avatarUrl?: string;
    // Add any other relevant fields from your backend's trainer DTO
}


export const trainerService = {
    getAllTrainers: async (page: number = 0, size: number = 20) => {
        try {
            const response = await api.get(`${trainerUrl}/all-trainers?page=${page}&size=${size}`);
            return response.data; // Returns the entire data object
        } catch (error) {
            console.error('Error fetching trainers:', error);
            throw error.response?.data || { message: 'Failed to fetch trainers' };
        }
    },

    getAllActiveTrainers: async (page: number = 0, size: number = 20) => {
        try {
            const response = await api.get(`${trainerUrl}/all-active-trainers?page=${page}&size=${size}`);
            return response.data; // Returns the entire data object
        } catch (error) {
            console.error('Error fetching active trainers:', error);
            throw error.response?.data || { message: 'Failed to fetch active trainers' };
        }
    },

    updateTrainerStatus: async (trainerId: number, status: string) => {
        try {
            // Assuming your backend endpoint for updating trainer status is something like this:
            const response = await api.patch(
                `${trainerUrl}/change-trainer-status/${trainerId}`,
                status, // just send the string directly
                { headers: { "Content-Type": "text/plain" } }
            );

            return response.data;
        } catch (error) {
            console.error(`Error updating trainer ${trainerId}:`, error);
            throw error.response?.data || { message: 'Failed to update trainer status' };
        }
    },
    getTrainerAverageRating: async (trainerId: number): Promise<AverageRatingResponse> => {
        try {
            const response = await api.get(`${feedbackUrl}/trainer/${trainerId}/average-rating`);
            // The backend returns ApiResponse with data containing averageRating
            // Assuming response.data is { success: 1, code: 200, message: "...", data: { averageRating: 5.0 } }
            if (response.data && response.data.data && typeof response.data.data.averageRating === 'number') {
                return { averageRating: response.data.data.averageRating };
            } else {
                // Handle cases where rating might be missing or null
                console.warn(`No average rating found for trainer ${trainerId} or unexpected response structure.`);
                return { averageRating: 0.0 }; // Return 0.0 if no rating is available
            }
        } catch (error: any) {
            console.error(`Error fetching average rating for trainer ${trainerId}:`, error);
            // If an error occurs (e.g., trainer not found, or no feedback yet), default to 0.0
            return { averageRating: 0.0 };
        }
    },

    getTotalMemberCount: async (trainerId: number) => {
        try {
            const response = await api.get<{ count: number }>(`/api/v1/book-package/trainer/${trainerId}/user-count`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching total members for trainer ${trainerId}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to fetch total member count');
        }
    },

    acceptTrainerApplication: async (trainerId: number) => {
        try {
            const response = await api.patch(
                `${trainerUrl}/accept-trainer-application/${trainerId}`
            );
            return response.data;
        } catch (error) {
            console.error(`Error accepting trainer application ${trainerId}:`, error);
            throw error.response?.data || { message: 'Failed to accept trainer application' };
        }
    },

    getTrainerApplications: async (role: string = "trainer", status: string = "pending", page: number = 0, size: number = 20) => {
        try {
            const response = await api.get(
                `${trainerUrl}/all-users?role=${role}&status=${status}&page=${page}&size=${size}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching trainer applications: ', error);
            throw error.response?.data || { message: 'Failed to fetch trainer applications' };
        }
    },

    getAllAvailableTrainers: async (page: number = 0, size: number = 20) => {
        try {
            const response = await api.get(`${trainerUrl}/all-available-trainers?page=${page}&size=${size}`);
            return response.data; // Returns the entire data object
        } catch (error) {
            console.error('Error fetching available trainers:', error);
            throw error.response?.data || { message: 'Failed to fetch available trainers' };
        }
    }

};


