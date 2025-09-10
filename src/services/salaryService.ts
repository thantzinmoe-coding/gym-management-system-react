// src/services/salaryService.ts
import api from '@/services/api';

const salaryUrl = '/api/v1/salaries';

export const salaryService = {
    // This function can be used for creating a salary record manually if needed,
    // but it is NOT for confirming a pending payment.
    createSalary: async (salaryData: {
        amount: number;
        notes?: string;
        trainerId: number;
    }) => {
        const response = await api.post(salaryUrl, salaryData);
        return response.data;
    },

    getAllSalaries: async () => {
        const response = await api.get(salaryUrl);
        return response.data; // This returns both PAID and PENDING salaries
    },

    getSalaryById: async (id: number) => {
        const response = await api.get(`${salaryUrl}/${id}`);
        return response.data;
    },

    // ✅ MODIFIED: This is the correct function to use for paying a pending salary.
    // It sends a PUT request to update the existing record.
    updateSalary: async (id: number, salaryData: {
        amount: number;
        notes?: string;
        trainerId: number;
    }) => {
        const response = await api.put(`${salaryUrl}/${id}`, salaryData);
        return response.data;
    },

    deleteSalary: async (id: number) => {
        await api.delete(`${salaryUrl}/${id}`);
        return true;
    },

    getTotalHoursWorkedByTrainer: async (trainerId: number) => {
        const response = await api.get(`/api/v1/attendance/trainer/${trainerId}/total-hours`);
        return response.data;
    }
};