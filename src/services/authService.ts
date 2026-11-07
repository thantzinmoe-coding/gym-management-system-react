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



  // Password reset (signed out): email a code, then set a new password with it.
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post('api/v1/forgotPassword', { email });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Could not send the reset code' };
    }
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    try {
      const response = await api.post('api/v1/forgotPassword/reset', { email, code: Number(code), newPassword });
      return response.data;
    } catch (error) {
      throw error?.response?.data || { message: 'Password reset failed' };
    }
  },

  //verify email with otp
  verifyEmail: async (email) => {
    try {
      const response = await api.post(`${userUrl}/verifyEmail`, {
        email: email
      });
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
        // The token lives only in the cookie; a second copy in localStorage was one more place to steal it from.
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
    localStorage.removeItem('token'); // clean up copies stored by older versions
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
    return !!Cookies.get('token');
  }
};