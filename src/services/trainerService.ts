// src/services/trainerService.ts
import api from '@/services/api';

const trainerUrl = '/api/v1/super_admin';
// Corrected: Relative to baseURL in api.ts

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

