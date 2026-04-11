import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product._id);
  const image = product.images?.[0]?.url || 'https://picsum.photos/400/400';
  const price = product.discountedPrice || product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    await addToCart(product._id);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    await toggleWishlist(product._id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card group cursor-pointer"
    >
      <Link to={`/products/${product.slug || product._id}`}>
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-xl bg-gray-50 h-52 sm:h-64">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.target.src = 'https://picsum.photos/400/400'; }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <span className="absolute top-2 left-2 discount-badge">
              -{product.discountPercentage}%
            </span>
          )}

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold bg-black/70 px-3 py-1 rounded">Out of Stock</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-colors ${
                inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50'
              }`}
            >
              <FiHeart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Brand */}
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.brand}</p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mt-0.5 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={12}
                  className={star <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
            {product.discountPercentage > 0 && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingCart size={14} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;