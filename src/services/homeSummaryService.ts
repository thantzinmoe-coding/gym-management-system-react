import api from '@/services/api';

const BASE_URL = '/api/v1/home-summary';

export const getHomeSummary = {
    getTotalMembers: async (role: string = 'MEMBER') => {
        const response = await api.get(`${BASE_URL}/user-count/${role}`);
        return response.data;
    },

    getTotalTrainers: async (role: string = 'TRAINER') => {
        const response = await api.get(`${BASE_URL}/user-count/${role}`);
        return response.data;
    },

    getTotalClasses: async () => {
        const response = await api.get(`${BASE_URL}/package-count`);
        return response.data;
    },

    getTotalReviews: async () => {
        const response = await api.get(`${BASE_URL}/review-count`);
        return response.data;
    }

}