import api from '@/services/api';

const profileUrl = '/api/v1/auth/profile';

export const userService = {
    // ==================== PROFILE MANAGEMENT ====================

    //Create profile
    createProfile: async (userId, profileRequest) => {
        try {
            const response = await api.post(`${profileUrl}/${userId}/create`, {
                name: profileRequest.name,
                nrc: profileRequest.nrc,
                dob: profileRequest.dob,
                gender: profileRequest.gender,
                phone: profileRequest.phone,
                address: profileRequest.address
            });
            return response.data;
        } catch (error) {
            console.error('Create profile error:', error);
            throw error.response?.data || { message: 'Failed to create profile' };
        }
    },

    //create user detail
    createUserDetail: async (data) => {
        try {
            const response = await api.post(`/api/v1/auth/user-detail-info/${data.entityId}`, {
                weight: data.weight || 0,
                height: data.height || 0,
                goal: data.goal || '',
                experience: data.experience || '',
                specialization: data.specialization || ''
            });
            return response.data;
        } catch (error) {
            console.error('Create user detail error:', error);
            throw error.response?.data || { message: 'Failed to create user detail' };
        }
    },

    // Get current user profile
    getUserProfile: async (userId) => {
        try {
            const response = await api.get(`${profileUrl}/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Get current profile error:', error);
            throw error.response?.data || { message: 'Failed to fetch profile' };
        }
    },

    // Update user profile
    updateProfile: async (profileData, userId) => {
        try {
            const response = await api.post(`${profileUrl}/${userId}/update`, {
                name: profileData.name,
                nrc: profileData.nrc,
                dob: profileData.dateOfBirth,
                gender: profileData.gender,
                phone: profileData.phone,
                address: profileData.address
            });
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error.response?.data || { message: 'Failed to update profile' };
        }
    },

    // Get user details by ID
    getUserDetails: async (userId) => {
        try {
            const response = await api.get(`/api/v1/auth/user-detail-info/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Get user details error:', error);
            throw error.response?.data || { message: 'Failed to fetch user details' };
        }
    },

    // Update user details
    updateUserDetails: async (userId, detailsData) => {
        try {
            const response = await api.put(`/api/v1/auth/user-detail-info/${userId}`, {
                weight: detailsData.weight || 0,
                height: detailsData.height || 0,
                goal: detailsData.goal || '',
                specialization: detailsData.specialization || '',
                experience: detailsData.experience || '',
            });
            return response.data;
        } catch (error) {
            console.error('Update user details error:', error);
            throw error.response?.data || { message: 'Failed to update user details' };
        }
    },

    // ==================== MEDIA MANAGEMENT ====================

    // Upload avatar
    uploadAvatar: async (file, userId) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(`${profileUrl}/${userId}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Upload avatar error:', error);
            throw error.response?.data || { message: 'Failed to upload avatar' };
        }
    },

    uploadProfilePicture: async (userId: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post(
            `${profileUrl}/${userId}/profile-picture`,
            formData
        );

        return response.data; // should contain { url: "uploadedFileUrl" }
    },
};