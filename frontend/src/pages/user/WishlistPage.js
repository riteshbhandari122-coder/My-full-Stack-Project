import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useWishlistStore } from '../../store/wishlistStore';
import ProductGrid from '../../components/product/ProductGrid';

const WishlistPage = () => {
  const { wishlist, loading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (!loading && wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FiHeart size={60} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save products you love to your wishlist</p>
        <Link to="/products" className="btn-primary inline-block">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">My Wishlist ({wishlist.length} items)</h1>
      <ProductGrid products={wishlist} loading={loading} cols={4} />
    </div>
  );
};

export default WishlistPage;
