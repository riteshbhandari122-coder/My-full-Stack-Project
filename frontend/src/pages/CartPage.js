import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon, loading } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch {}
    setApplyingCoupon(false);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please login to view your cart</h2>
        <Link to="/login" className="btn-primary inline-block mt-4">Login to Continue</Link>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FiShoppingBag size={80} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link to="/products" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.discountAmount || 0;
  const shipping = subtotal > 2000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.13);
  const total = subtotal - discount + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Shopping Cart ({cart.items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl p-4 flex gap-4 shadow-card"
            >
              <Link to={`/products/${item.product?._id}`}>
                <img
                  src={
  (item.color
    ? item.product?.images?.find(img => img.color?.toLowerCase() === item.color?.toLowerCase())?.url
    : null)
  || item.product?.images?.[0]?.url
  || 'https://picsum.photos/100/100'
}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`} className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-primary-600">
                  {item.product?.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.product?.brand}</p>
                {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartItem(item._id, item.quantity - 1)} className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                      <FiMinus size={12} />
                    </button>
                    <span className="font-semibold w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateCartItem(item._id, item.quantity + 1)} disabled={item.quantity >= item.product?.stock} className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50">
                      <FiPlus size={12} />
                    </button>
                    <button onClick={() => removeFromCart(item._id)} className="w-7 h-7 rounded-lg border border-red-300 text-red-500 flex items-center justify-center hover:bg-red-50 ml-2">
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl p-5 shadow-card sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>

            {/* Coupon */}
            <form onSubmit={handleApplyCoupon} className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                <FiTag size={14} /> Coupon Code
              </label>
              {cart.couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg px-3 py-2">
                  <span className="text-green-700 font-medium text-sm">{cart.couponCode} applied!</span>
                  <button onClick={removeCoupon} type="button" className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="submit" disabled={applyingCoupon} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                    Apply
                  </button>
                </div>
              )}
            </form>

            {/* Price Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (13%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-xs text-center text-gray-500 mb-3">
                Add NPR {formatPrice(2000 - subtotal)} more for FREE shipping
              </p>
            )}

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-600 mt-3 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
