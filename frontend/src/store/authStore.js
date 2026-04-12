import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ loading: false });
          return;
        }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, loading: false });
        } catch {
          set({ user: null, token: null, loading: false });
        }
      },

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, token: data.token });
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        return data;
      },

      loginWithToken: async (token) => {
        set({ token });
        try {
          const { data } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: data.user, token });
          toast.success(`Welcome, ${data.user.name}! 👋`);
        } catch {
          set({ user: null, token: null });
          toast.error('Google login failed');
        }
      },

      register: async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        set({ user: data.user, token: data.token });
        toast.success('Account created successfully! 🎉');
        return data;
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },

      forgotPassword: async (email) => {
        const { data } = await api.post('/auth/forgot-password', { email });
        return data;
      },

      resetPassword: async (token, password) => {
        const { data } = await api.put(`/auth/reset-password/${token}`, { password });
        if (data.token) set({ token: data.token });
        return data;
      },

      updatePassword: async (currentPassword, newPassword) => {
        const { data } = await api.put('/auth/update-password', { currentPassword, newPassword });
        if (data.token) set({ token: data.token });
        return data;
      },
    }),
    {
      name: 'shopmart-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);