// equipmentService.ts
import api from "@/services/api";

export interface EquipmentResponse {
    id: string; // Changed to string to match frontend
    name: string;
    purchaseDate: string;
    equipmentCondition: "Excellent" | "Good" | "Fair" | "Poor";
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    equipmentPhoto?: string;
}

interface ApiResponse<T> {
    success: number;
    code: number;
    message: string;
    data: T;
}

interface PaginatedEquipmentResponse {
    data: EquipmentResponse[];
    meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
}

const equipmentUrl = "/api/v1/equipment";

function toFormData(data: any): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (key === "equipmentPhoto" && value instanceof File) {
                formData.append("equipmentPhoto", value);
            } else {
                formData.append(key, String(value));
            }
        }
    });
    return formData;
}

export const equipmentService = {
    getAllEquipments: async (
        page: number = 0,
        size: number = 20
    ): Promise<EquipmentResponse[]> => {
        try {
            const response = await api.get<PaginatedEquipmentResponse>(
                `${equipmentUrl}?page=${page}&size=${size}`
            );
            return response.data.data.map((eq) => ({
                ...eq,
                id: String(eq.id),
                imageUrl: eq.equipmentPhoto, // 👈 map backend field to frontend field
            }));
        } catch (error) {
            console.error("Failed to fetch equipments:", error);
            throw error;
        }
    },


    getEquipmentById: async (id: string): Promise<EquipmentResponse> => {
        try {
            const response = await api.get<ApiResponse<{ equipment: EquipmentResponse }>>(
                `${equipmentUrl}/${id}`
            );
            const equipment = response.data.data.equipment;
            return {
                ...equipment,
                id: String(equipment.id),
                imageUrl: equipment.equipmentPhoto, // 👈 consistent mapping
            };
        } catch (error) {
            console.error("Failed to fetch equipment:", error);
            throw error;
        }
    },

    addEquipment: async (data: any): Promise<EquipmentResponse> => {
        try {
            const formData = toFormData(data);
            const response = await api.post<ApiResponse<{ equipment: EquipmentResponse }>>(
                equipmentUrl,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            console.log("Add Equipment Response:", response.data);
            const equipment = response.data.data.equipment;
            return {
                ...equipment,
                id: String(equipment.id),
                imageUrl: equipment.equipmentPhoto, // map backend -> frontend
            };
        } catch (error) {
            console.error("Failed to add equipment:", error);
            throw error;
        }
    },


    updateEquipment: async (id: string, data: any): Promise<EquipmentResponse> => {
        try {
            const formData = toFormData(data);
            const response = await api.patch<ApiResponse<{ equipment: EquipmentResponse }>>(
                `${equipmentUrl}/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            console.log("Update Equipment Response:", response.data);
            const equipment = response.data.data.equipment;
            return {
                ...equipment,
                id: String(equipment.id),
                imageUrl: equipment.equipmentPhoto, // 👈 consistent mapping
            };
        } catch (error) {
            console.error("Failed to update equipment:", error);
            throw error;
        }
    },

    deleteEquipment: async (id: string): Promise<void> => {
        try {
            await api.delete(`${equipmentUrl}/${id}`);
        } catch (error) {
            console.error("Failed to delete equipment:", error);
            throw error;
        }
    },

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