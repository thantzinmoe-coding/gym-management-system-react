// src/services/equipmentService.ts
import api from '@/services/api';

// Define your data types
export interface EquipmentResponse {
    Condition: string; // Removed export
    id: string;
    name: string;
    purchaseDate: string;
    equipmentCondition: "Excellent" | "Good" | "Fair" | "Poor";
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    imageUrl?: string;
}

interface PaginatedEquipmentResponse {
    data: EquipmentResponse[];
    meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
}

interface EquipmentCreateData {
    name: string;
    purchaseDate: string;
    equipmentCondition: "Excellent" | "Good" | "Fair" | "Poor";
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    imageUrl?: string;
}

const equipmentUrl = '/api/v1/equipment';

export const equipmentService = {
    getAllEquipments: async (page: number = 0, size: number = 20): Promise<EquipmentResponse[]> => { // Changed return type
        try {
            const response = await api.get<PaginatedEquipmentResponse>(`${equipmentUrl}?page=${page}&size=${size}`);
            return response.data.data; // Return only the data array
        } catch (error: any) {
            console.error('Error fetching equipments:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch equipments'); // Throw Error
        }
    },

    getEquipmentById: async (id: string): Promise<EquipmentResponse> => {
        try {
            const response = await api.get<EquipmentResponse>(`${equipmentUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching equipment with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to fetch equipment'); // Throw Error
        }
    },

    addEquipment: async (data: EquipmentCreateData): Promise<EquipmentResponse> => {
        try {
            const response = await api.post<EquipmentResponse>(`${equipmentUrl}`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error adding equipment:', error);
            throw new Error(error.response?.data?.message || 'Failed to add equipment'); // Throw Error
        }
    },

    updateEquipment: async (id: string, data: EquipmentCreateData): Promise<EquipmentResponse> => {
        try {
            const response = await api.patch<EquipmentResponse>(`${equipmentUrl}/${id}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating equipment with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to update equipment'); // Throw Error
        }
    },

    deleteEquipment: async (id: string): Promise<any> => { // No response data
        try {
            const response = await api.delete(`${equipmentUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error deleting equipment with ID ${id}:`, error);
            throw new Error(error.response?.data?.message || 'Failed to delete equipment'); // Throw Error
        }
    },
    // equipmentService.ts
  getEquipmentCount: async (): Promise<number> => {
  try {
    const response = await api.get<PaginatedEquipmentResponse>(`${equipmentUrl}?page=0&size=1`);
    return response.data.meta.totalItems; // ✅ use meta.totalItems
  } catch (error: any) {
    console.error('Error fetching equipment count:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch equipment count');
  }
},

};