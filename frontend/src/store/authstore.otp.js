// authStore.otp.js
// ─────────────────────────────────────────────────────────────────────────────
// Add these two actions to your existing useAuthStore (Zustand) store.
// Paste them inside the create(...) callback alongside your other actions.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Action 1: Send OTP ──────────────────────────────────────────────────────
//
// sendOtp: async (email) => {
//   const res = await fetch('/api/auth/send-otp', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email }),
//   });
//   const data = await res.json();
//   if (!data.success) throw new Error(data.message);
//   return data;
// },

// ─── Action 2: Verify OTP and Reset Password ─────────────────────────────────
//
// verifyOtpAndReset: async ({ email, otp, newPassword }) => {
//   const res = await fetch('/api/auth/verify-otp', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, otp, newPassword }),
//   });
//   const data = await res.json();
//   if (!data.success) throw new Error(data.message);
//   return data;
// },

// ─────────────────────────────────────────────────────────────────────────────
// FULL EXAMPLE — if you're using Zustand with axios instead of fetch:
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import axios from 'axios';

// Paste the sendOtp and verifyOtpAndReset into your EXISTING store.
// This file shows a minimal example of the store with just the new actions.
// Do NOT replace your whole store with this — only copy the new actions.

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // ─── NEW: Send OTP to email ───────────────────────────────────────────────
  sendOtp: async (email) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post('/api/auth/send-otp', { email });
      if (!data.success) throw new Error(data.message);
      set({ loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to send OTP';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  // ─── NEW: Verify OTP and reset password ──────────────────────────────────
  verifyOtpAndReset: async ({ email, otp, newPassword }) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post('/api/auth/verify-otp', {
        email,
        otp,
        newPassword,
      });
      if (!data.success) throw new Error(data.message);
      set({ loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to reset password';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  // ... your other existing actions (login, logout, register, etc.) go here
}));