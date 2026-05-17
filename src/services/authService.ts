import api from '@/services/api';
import Cookies from 'js-cookie';

const userUrl = 'api/v1/auth/users';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post(`${userUrl}`, {
        email: userData.email,
        password: userData.password,
        role: userData.role
      });

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error?.response?.data || { message: 'Registration failed' };
    }
  },



  //verify email with otp
  verifyEmail: async (email) => {
    try {
      const response = await api.post(`${userUrl}/verifyEmail`, {
        email: email
      });
      console.log('OTP send message:', response.data);
      return response.data;
    } catch (error) {
      console.error('OTP send error:', error);
      throw error?.response?.data || { message: 'OTP send failed' };
    }
  },


  verifyAccount: async (data) => {
    try {
      const response = await api.post(`${userUrl}/verifyAccount`, {
        email: data.email,
        code: data.otp
      });
      console.log("Response data: " + response.data.message);
      return true;
    } catch (error) {
      console.error('Account verification error:', error);
      throw error.response?.data || { message: 'Account verification failed' };
    }
  },

  //Resend OTP
  resendOTP: async (email) => {
    try {
      const response = await api.post(`${userUrl}/resendCode`, {
        email: email
      });
      return response;
    } catch (error) {
      console.error('Resending otp error:', error);
      throw error.response?.data || { message: 'Failed to send otp' };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post(`${userUrl}/login`, {
        email: email,
        password: password
      });

      if (response) {
        localStorage.setItem('token', response.data.data?.token || "");
        localStorage.setItem('user', JSON.stringify({
          id: response.data.data?.userId,
          email: response.data.data?.email,
          role: response.data.data?.roleName.toLowerCase(),
          message: response.data.message
        }));
        Cookies.set('token', response.data.data?.token || "", { expires: 1 });
        Cookies.set('refreshToken', response.data.data?.refreshToken || "", { expires: 1 });
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error?.response?.data);
      throw error?.response?.data || { message: 'Login failed' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token');
    Cookies.remove('refreshToken');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};