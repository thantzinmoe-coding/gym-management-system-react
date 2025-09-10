import api from '@/services/api';

const bookPackageUrl = '/api/v1/book-package';

export const bookPackageService = {
  // ✅ Book a gym package
  bookGymPackage: async (request: { memberID: number; gymPackageID: number }) => {
    try {
      const response = await api.post(`${bookPackageUrl}`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error booking gym package:', error);
      throw error.response?.data || { message: 'Failed to book gym package' };
    }
  },

  // ✅ Cancel booking
  cancelGymPackage: async (bookingId: number) => {
    try {
      const response = await api.delete(`${bookPackageUrl}/${bookingId}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      throw error.response?.data || { message: 'Failed to cancel booking' };
    }
  },

  // ✅ Get bookings by memberId (with pagination)
  getBookingsByMember: async (memberId: number, page = 0, size = 10) => {
    try {
      const response = await api.get(`${bookPackageUrl}/${memberId}/detail`, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching member bookings:', error);
      throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
  },

  // ✅ Get booking details by bookingId
  getBookingById: async (bookingId: number) => {
    try {
      const response = await api.get(`${bookPackageUrl}/${bookingId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching booking detail:', error);
      throw error.response?.data || { message: 'Failed to fetch booking detail' };
    }
  },

  // ✅ Get all bookings by packageId (with pagination)
  getBookingsByPackage: async (packageId: number, page = 0, size = 10) => {
    try {
      const response = await api.get(
        `${bookPackageUrl}/${packageId}/get-by-package-id`,
        { params: { page, size } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching package bookings:', error);
      throw error.response?.data || { message: 'Failed to fetch package bookings' };
    }
  },

  // ✅ Get user count by trainer
  getUserCountByTrainer: async (trainerId: number) => {
    try {
      const response = await api.get(
        `${bookPackageUrl}/trainer/${trainerId}/user-count`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user count by trainer:', error);
      throw error.response?.data || { message: 'Failed to fetch user count' };
    }
  },
};
