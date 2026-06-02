import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// 1. Request Interceptor: Attach authentication token if existing
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Silent token refresh on expired access credentials (401)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token not found in localStorage');
        }

        // Use direct axios call to prevent circular interceptor loops
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`, {
          refreshToken,
        });

        if (res.data && res.data.success) {
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          // Retry the original request with the fresh token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.warn('⚠️ Token refresh failed. Logging user out...', refreshError.message);
        
        // Wipe local caches
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Bounce to login panel
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
