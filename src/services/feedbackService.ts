import api from '@/services/api';

export const feedbackService = {
    giveFeedback: async (feedbackData) => {
        try {
            const response = await api.post('/api/v1/feedback', {
                trainerName: feedbackData.trainerName,
                rating: feedbackData.rating,
                feedback: feedbackData.feedback
            });
            return response.data;
        } catch (error) {
            console.error('Give feedback error:', error);
            throw error.response?.data || { message: 'Failed to submit feedback' };
        }
    },


    getFeedbackHistory: async (userId) => {
        try {
            const response = await api.get(`/api/v1/feedback/user/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Get feedback history error:', error);
            throw error.response?.data || { message: 'Failed to fetch feedback history' };
        }
    }
}