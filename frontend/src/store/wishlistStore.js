import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,

  fetchWishlist: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/wishlist');
      set({ wishlist: data.wishlist, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const isInWishlist = get().wishlist.some((p) => p._id === productId || p === productId);
    try {
      const { data } = await api.put(`/wishlist/${productId}/toggle`);
      if (data.inWishlist) {
        toast.success('Added to wishlist ❤️');
      } else {
        toast.success('Removed from wishlist');
      }
      // Refresh wishlist
      const wishlistData = await api.get('/wishlist');
      set({ wishlist: wishlistData.data.wishlist });
      return data.inWishlist;
    } catch (err) {
      toast.error('Please login to add to wishlist');
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some((p) => p._id === productId || p === productId);
  },
}));
