// src/services/scheduleService.ts
import api from '@/services/api';

const scheduleUrl = '/api/v1/schedule';

// Define the shape of the data for better type safety
// src/services/scheduleService.ts
interface Schedule {
    id?: number; // optional because new schedules won’t have it yet
    day: string;
    startTime: string;
    endTime: string;
}

interface ScheduleBulkRequest {
    gymPackageId: number;
    schedules: Schedule[];
}

export const scheduleService = {
    /**
     * Create multiple schedules for a single gym package in one request.
     * @param bulkRequestData - An object containing gymPackageId and an array of schedules.
     */
    createBulkSchedules: async (bulkRequestData: ScheduleBulkRequest) => {
        try {
            const response = await api.post(`${scheduleUrl}/bulk`, bulkRequestData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating bulk schedules:', error);
            throw error.response?.data || { message: 'Failed to create schedules' };
        }
    },

    /**
     * Get a single schedule by its ID.
     * @param id - The ID of the schedule.
     */
    getScheduleById: async (id: number) => {
        try {
            const response = await api.get(`${scheduleUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching schedule with id ${id}:`, error);
            throw error.response?.data || { message: 'Failed to fetch schedule' };
        }
    },

    /**
     * Get all schedules with pagination.
     */
    getAllSchedules: async (page: number = 0, size: number = 20) => {
        try {
            const response = await api.get(`${scheduleUrl}?page=${page}&size=${size}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching all schedules:', error);
            throw error.response?.data || { message: 'Failed to fetch schedules' };
        }
    },

    /**
     * Update an existing schedule by its ID.
     * @param id - The ID of the schedule to update.
     * @param scheduleData - The updated schedule data.
     */
    updateSchedule: async (id: number, scheduleData: Schedule) => {
        try {
            const response = await api.put(`${scheduleUrl}/${id}`, scheduleData);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating schedule with id ${id}:`, error);
            throw error.response?.data || { message: 'Failed to update schedule' };
        }
    },

    /**
     * Delete a schedule by its ID.
     * @param id - The ID of the schedule to delete.
     */
    deleteSchedule: async (id: number) => {
        try {
            const response = await api.delete(`${scheduleUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error deleting schedule with id ${id}:`, error);
            throw error.response?.data || { message: 'Failed to delete schedule' };
        }
    }
};