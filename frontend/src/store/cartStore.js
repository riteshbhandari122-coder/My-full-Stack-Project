import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/cart');
      set({ cart: data.cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addToCart: async (productId, quantity = 1, color = '', size = '') => {
    try {
      const { data } = await api.post('/cart', { productId, quantity, color, size });
      set({ cart: data.cart });
      toast.success('Added to cart! 🛒');
      return data.cart;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      set({ cart: data.cart });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      set({ cart: data.cart });
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ cart: null });
    } catch {}
  },

  applyCoupon: async (code) => {
    try {
      const { data } = await api.post('/cart/coupon', { code });
      set((state) => ({
        cart: state.cart ? { ...state.cart, couponCode: data.couponCode, discountAmount: data.discount } : null,
      }));
      toast.success(`Coupon applied! You saved NPR ${data.discount} 🎉`);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      throw err;
    }
  },

  removeCoupon: async () => {
    try {
      await api.delete('/cart/coupon');
      set((state) => ({
        cart: state.cart ? { ...state.cart, couponCode: '', discountAmount: 0 } : null,
      }));
      toast.success('Coupon removed');
    } catch {}
  },

  getCartCount: () => {
    const { cart } = get();
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },

  getCartTotal: () => {
    const { cart } = get();
    if (!cart?.items) return 0;
    const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    return subtotal - (cart.discountAmount || 0);
  },
}));
