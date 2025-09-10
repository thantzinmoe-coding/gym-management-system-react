// src/services/gymPackageService.ts
import api from '@/services/api';

const gymPackageUrl = '/api/v1/gym-package';

export const gymPackageService = {
    // Create a new gym package
    createGymPackage: async (gymPackageData: any) => {
        try {
            const response = await api.post(`${gymPackageUrl}`, gymPackageData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating gym package:', error);
            throw error.response?.data || { message: 'Failed to create gym package' };
        }
    },

    // Get gym package by ID
    getGymPackageById: async (id: number) => {
        try {
            const response = await api.get(`${gymPackageUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching gym package with id ${id}:`, error);
            throw error.response?.data || { message: 'Failed to fetch gym package' };
        }
    },

    // Get all gym packages (paginated)
    getAllGymPackages: async (page: number = 0, size: number = 20) => {
        try {
            const response = await api.get(`${gymPackageUrl}?page=${page}&size=${size}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching gym packages:', error);
            throw error.response?.data || { message: 'Failed to fetch gym packages' };
        }
    },

    // Get gym packages by type (PERSONAL, GROUP, etc.)
    getGymPackagesByType: async (type: string, page: number = 0, size: number = 20) => {
        try {
            const response = await api.get(`${gymPackageUrl}/${type}/get-by-type?page=${page}&size=${size}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching gym packages by type ${type}:`, error);
            throw error.response?.data || { message: 'Failed to fetch gym packages by type' };
        }
    },

    // Update gym package
    updateGymPackage: async (id: number, gymPackageData: any) => {
        try {
            const response = await api.put(`${gymPackageUrl}/${id}`, gymPackageData);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating gym package with id ${id}:`, error);
            throw error.response?.data || { message: 'Failed to update gym package' };
        }
    },

    // Delete gym package
    deleteGymPackage: async (id: number) => {
        try {
            const response = await api.delete(`${gymPackageUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error deleting gym package with id ${id}:`, error);
            throw error.response?.data || { message: 'Failed to delete gym package' };
        }
    }
};
