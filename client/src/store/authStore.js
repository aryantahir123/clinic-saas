import { create } from 'zustand';
import * as authApi from '../api/authApi';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Performs user login, sets local state, and stores tokens in localStorage
   */
  loginAction: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });

        return response;
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Logs out the user, invalidates token in backend, and cleans local state caches
   */
  logoutAction: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('refreshToken');
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.warn('⚠️ Backend session logout sync failed:', error.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Validates active sessions by requesting current user profile upon app load
   */
  initializeAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      if (response.success) {
        set({
          user: response.data,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error('Identity verification returned unvalidated status');
      }
    } catch (error) {
      console.warn('⚠️ Session verification failed. Wiping authentication state...', error.message);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
