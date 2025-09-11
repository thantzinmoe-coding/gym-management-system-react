// src/services/assignedGymPackageService.ts
import api from '@/services/api';

const assignedGymPackageUrl = '/api/v1/assign-gym-package';

export const assignedGymPackageService = {
  // ✅ Assign a trainer to a gym package
  assignSchedule: async (assignedData: { trainerId: number; gymPackageId: number }) => {
    try {
      const response = await api.post(`${assignedGymPackageUrl}`, assignedData);
      return response.data;
    } catch (error: any) {
      console.error('Error assigning schedule:', error);
      throw error.response?.data || { message: 'Failed to assign schedule' };
    }
  },

  // ✅ Unassign a trainer from a package (by assigned ID)
  unassignSchedule: async (id: number, packageId: number) => {
    try {
      const response = await api.delete(`${assignedGymPackageUrl}/${id}/${packageId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error unassigning schedule with id ${id}:`, error);
      throw error.response?.data || { message: 'Failed to unassign schedule' };
    }
  },

  updateAssignedSchedule: async (trainerId: number, packageId: number) => {
    try {
      const response = await api.patch(`${assignedGymPackageUrl}/${trainerId}/${packageId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating assigned schedule with id ${id}:`, error);
      throw error.response?.data || { message: 'Failed to update assigned schedule' };
    }
  },


  // ✅ Get all assigned packages (paginated)
  getAllAssignedPackagesByTrainerId: async (trainerId: number, page: number = 0, size: number = 20) => {
    try {
      const response = await api.get(`${assignedGymPackageUrl}/assign-package-by-trainer/${trainerId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching assigned packages:', error);
      throw error.response?.data || { message: 'Failed to fetch assigned packages' };
    }
  },
};
