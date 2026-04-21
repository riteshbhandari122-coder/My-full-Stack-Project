import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag, FiArrowRight, FiPackage } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';

// ─── Empty State Components ───────────────────────────────────────────────────
const NotLoggedIn = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', maxWidth: '420px' }}
    >
      {/* Illustration */}
      <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}>
        <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '72px' }}>🛒</span>
        </div>
        <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}>
          🔒
        </div>
      </div>

      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        Sign in to view your cart
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>
        Login to see your saved items, apply coupons, and checkout faster.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '14px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0f1b2d', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
          Sign In <FiArrowRight size={16} />
        </Link>
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'white', color: '#0f172a', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
          Create Account
        </Link>
      </div>
    </motion.div>
  </div>
);

const EmptyCart = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '480px' }}>
      {/* Illustration */}
      <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 28px' }}>
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FiShoppingBag size={80} style={{ color: '#93c5fd' }} />
        </div>
        <motion.div
          animate={{ y: [-4, 4, -4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-4px', right: '8px', fontSize: '32px' }}
        >😢</motion.div>
      </div>

      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        Your cart is empty
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>
        Looks like you haven't added anything yet. Browse our products and find something you love!
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '14px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0f1b2d', fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
          <FiPackage size={16} /> Start Shopping
        </Link>
        <Link to="/spin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'white', color: '#0f172a', fontFamily: 'Syne, sans-serif', fontWeight: 600, textDecoration: 'none' }}>
          🎰 Spin & Win Coupons
        </Link>
      </div>

      {/* Suggested categories */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { emoji: '📱', label: 'Phones', to: '/category/mobile-phones' },
          { emoji: '💻', label: 'Laptops', to: '/category/laptops' },
          { emoji: '👗', label: 'Clothes', to: '/category/clothes' },
          { emoji: '🎧', label: 'Electronics', to: '/category/electronics' },
        ].map(({ emoji, label, to }) => (
          <Link key={label} to={to} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '100px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef3c7'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#92400e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
          >
            {emoji} {label}
          </Link>
        ))}
      </div>
    </motion.div>
  </div>
);

// ─── Main CartPage ─────────────────────────────────────────────────────────────
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

  if (!user) return <NotLoggedIn />;
  if (!cart || cart.items?.length === 0) return <EmptyCart />;

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
            <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-xl p-4 flex gap-4 shadow-card">
              <Link to={`/products/${item.product?._id}`}>
                <img
                  src={(item.color ? item.product?.images?.find(img => img.color?.toLowerCase() === item.color?.toLowerCase())?.url : null) || item.product?.images?.[0]?.url || 'https://picsum.photos/100/100'}
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
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <button type="submit" disabled={applyingCoupon} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">Apply</button>
                </div>
              )}
            </form>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="text-green-600">-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (13%)</span><span>{formatPrice(tax)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            {shipping > 0 && <p className="text-xs text-center text-gray-500 mb-3">Add {formatPrice(2000 - subtotal)} more for FREE shipping</p>}
            <button onClick={() => navigate('/checkout')} className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2">
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-600 mt-3 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;