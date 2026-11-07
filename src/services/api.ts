import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Base URL for your Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Add timeout
  withCredentials: true, // Required for CORS
});

// Queue to hold failed requests during token refresh
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Public auth calls (sign in, register, OTP) must not carry a possibly expired token, and a
// 401 from them means "wrong credentials", not "refresh the session".
const isPublicAuthCall = (url?: string) =>
  !!url && /(auth\/users(\/(login|verifyEmail|verifyAccount|resendCode))?|forgotPassword(\/(verifyCode|reset))?)\/?$/.test(url.split('?')[0]);

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token && !isPublicAuthCall(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle responses and errors with token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse | unknown> => {
    
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle token expiration
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry
        && !isPublicAuthCall(originalRequest.url)) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const storedRefreshToken = Cookies.get('refreshToken');
          if (!storedRefreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/users/getRefreshToken`,
            {},
            {
              headers: {
                Authorization: `Bearer ${storedRefreshToken}`,
              }
            }
          );
          const newRefreshToken: string = response.data.data.refreshToken;

          if (newRefreshToken) {
            Cookies.set('token', newRefreshToken, { expires: 1 });
            Cookies.set('refreshToken', newRefreshToken, { expires: 1 });
          }

          processQueue(null, newRefreshToken);
          isRefreshing = false;

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newRefreshToken}`;
          }

          return await api(originalRequest);
        } catch (refreshError) {
          const err = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
          processQueue(err, null);
          isRefreshing = false;
          
          // Clear auth data
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to auth page
          // Send the user to sign in, but never reload the login page itself: that wiped the
          // form while someone with an expired session was typing their password.
          if (!window.location.pathname.startsWith('/login')) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          }
          return Promise.reject(err);
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: unknown) => {
            if (typeof token === 'string' && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject: (err) => {
            reject(err instanceof Error ? err : new Error('Retry queue failed'));
          },
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;