import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Base URL for your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080';

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

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging (remove in production)
    console.log('🚀 API Request:', {
      url: config.baseURL + config.url,
      method: config.method?.toUpperCase(),
      headers: config.headers
    });
    
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
    // Debug logging (remove in production)
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse | unknown> => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle token expiration
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
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
          Cookies.remove('user');
          
          // Redirect to auth page
          window.location.href = '/auth';
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