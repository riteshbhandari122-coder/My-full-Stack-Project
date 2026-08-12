import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag, FiArrowRight, FiPackage } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';

const NotLoggedIn = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '420px' }}>
      <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <span style={{ fontSize: '72px' }}>🛒</span>
      </div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#0f172a', marginBottom: '8px' }}>Sign in to view your cart</h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px' }}>Login to see your saved items, apply eco-coupons, and checkout faster.</p>
      <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '14px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>
        Sign In <FiArrowRight size={16} />
      </Link>
    </motion.div>
  </div>
);

const EmptyCart = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '480px' }}>
      <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
        <FiShoppingBag size={80} style={{ color: '#10b981' }} />
      </div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#0f172a', marginBottom: '8px' }}>Your eco-cart is empty</h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px' }}>Explore our eco-friendly catalog and start filling your cart!</p>
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '14px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>
        <FiPackage size={16} /> Start Eco Shopping
      </Link>
    </motion.div>
  </div>
);

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  // ✅ Auto-fill and apply redeemed reward coupon from local storage
  useEffect(() => {
    const savedCoupon = localStorage.getItem('applied_eco_coupon');
    if (savedCoupon && user) {
      applyCoupon(savedCoupon).catch(() => {});
      localStorage.removeItem('applied_eco_coupon');
    }
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

  // ✅ Real Discount Calculation Logic (Percentage vs Fixed amounts)
  let discount = cart.discountAmount || 0;
  if (cart.coupon?.type === 'percent') {
    discount = (subtotal * cart.coupon.value) / 100;
  } else if (cart.coupon?.type === 'fixed') {
    discount = cart.coupon.value;
  }

  const shipping = subtotal > 2000 ? 0 : 100;
  const tax = Math.round((subtotal - discount) * 0.13);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Shopping Cart ({cart.items.length} items)[cite: 3, 5]</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-xl p-4 flex gap-4 shadow-card">
              <Link to={`/products/${item.product?._id}`}>
                <img
                  src={item.product?.images?.[0]?.url || 'https://picsum.photos/100/100'}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`} className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-emerald-600">
                  {item.product?.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.product?.brand}</p>
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

        <div>
          <div className="bg-white rounded-xl p-5 shadow-card sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
            <form onSubmit={handleApplyCoupon} className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FiTag size={14} /> Coupon Code
              </label>
              {cart.couponCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2">
                  <span className="text-emerald-700 font-medium text-sm">{cart.couponCode} applied!</span>
                  <button onClick={removeCoupon} type="button" className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button type="submit" disabled={applyingCoupon} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">Apply</button>
                </div>
              )}
            </form>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-600">Discount</span><span className="text-emerald-600">-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className={shipping === 0 ? 'text-emerald-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (13%)</span><span>{formatPrice(tax)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            {/* ✅ Safe Navigation Handler */}
            <button 
              type="button"
              onClick={() => {
                try {
                  navigate('/checkout');
                } catch (err) {
                  console.error('Checkout navigation error:', err);
                  window.location.href = '/checkout';
                }
              }} 
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Checkout
            </button>

            <Link to="/products" className="block text-center text-sm text-emerald-600 mt-3 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;