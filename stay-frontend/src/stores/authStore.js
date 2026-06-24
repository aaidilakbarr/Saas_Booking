import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('stay_user')) || null,
  token: localStorage.getItem('stay_token') || null,
  isAuthenticated: !!localStorage.getItem('stay_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('stay_token', access_token);
      localStorage.setItem('stay_user', JSON.stringify(user));

      set({
        token: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login gagal. Coba lagi.';
      set({ isLoading: false, error: errMsg });
      throw err;
    }
  },

  register: async (name, email, password, password_confirmation, phone) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation,
        phone,
      });
      const { access_token, user } = response.data;

      localStorage.setItem('stay_token', access_token);
      localStorage.setItem('stay_user', JSON.stringify(user));

      set({
        token: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registrasi gagal. Coba lagi.';
      set({ isLoading: false, error: errMsg });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem('stay_token');
      localStorage.removeItem('stay_user');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  updateProfile: async (name, phone, avatarFile) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (phone) formData.append('phone', phone);
      if (avatarFile) formData.append('avatar', avatarFile);

      // We use post instead of put because PHP cannot parse multipart/form-data on PUT out-of-the-box
      const response = await api.post('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data.user;
      localStorage.setItem('stay_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal memperbarui profil.';
      set({ isLoading: false, error: errMsg });
      throw err;
    }
  },

  checkAuth: async () => {
    if (!get().token) return;
    try {
      const response = await api.get('/auth/me');
      const refreshedUser = response.data;
      localStorage.setItem('stay_user', JSON.stringify(refreshedUser));
      set({ user: refreshedUser, isAuthenticated: true });
    } catch (err) {
      // 401 is handled by Axios interceptor
      console.error('Refreshed auth check failed:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
