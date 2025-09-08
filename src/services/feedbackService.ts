import api from '@/services/api';

export const feedbackService = {
    giveFeedback: async (feedbackData) => {
        try {
            const response = await api.post('/api/v1/feedback', {
                comment: feedbackData.comment,
                ratingPoints: feedbackData.ratingPoints,
                member_id: Number(feedbackData.member_id),
                trainer_id: Number(feedbackData.trainer_id)
            });
            return response.data;
        } catch (error) {
            console.error('Give feedback error:', error);
            throw error.response?.data || { message: 'Failed to submit feedback' };
        }
    },

    // fetch single feedback by ID
    getFeedbackById: async (id) => {
        try {
            const response = await api.get(`/api/v1/feedback/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get feedback by ID error:', error);
            throw error.response?.data || { message: 'Failed to fetch feedback' };
        }
    },

    // fetch all feedback (paginated)
    listFeedbacks: async (page = 0, size = 20) => {
        try {
            const response = await api.get(`/api/v1/feedback?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error('List feedbacks error:', error);
            throw error.response?.data || { message: 'Failed to fetch feedback list' };
        }
    },

    // update feedback
    updateFeedback: async (id, updateData) => {
        try {
            const response = await api.patch(`/api/v1/feedback/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Update feedback error:', error);
            throw error.response?.data || { message: 'Failed to update feedback' };
        }
    },

    // delete feedback
    deleteFeedback: async (id) => {
        try {
            const response = await api.delete(`/api/v1/feedback/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete feedback error:', error);
            throw error.response?.data || { message: 'Failed to delete feedback' };
        }
    },

    // get average rating for trainer
    getAverageRatingForTrainer: async (trainerId) => {
        try {
            const response = await api.get(`/api/v1/feedback/trainer/${trainerId}/average-rating`);
            return response.data;
        } catch (error) {
            console.error('Get average rating error:', error);
            throw error.response?.data || { message: 'Failed to fetch average rating' };
        }
    }
};
