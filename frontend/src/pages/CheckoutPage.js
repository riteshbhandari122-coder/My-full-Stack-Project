import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiMapPin, FiPlus, FiCreditCard, FiTruck, FiArrowLeft } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';

// Auto-build and submit a hidden form — required for eSewa's v2 API, which
// expects a signed form POST rather than a simple redirect URL.
function redirectToEsewa(formAction, formData) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formAction;
  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

const STEPS = ['Address', 'Payment', 'Review'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Nepal', isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('esewa'); // esewa | khalti | cod
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  useEffect(() => {
    if (user?.addresses?.length) {
      setAddresses(user.addresses);
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def._id);
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }
  if (!cart || cart.items?.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = cart.discountAmount || 0;
  if (cart.coupon?.type === 'percent') discount = (subtotal * cart.coupon.value) / 100;
  else if (cart.coupon?.type === 'fixed') discount = cart.coupon.value;
  const shipping = subtotal > 2000 ? 0 : 100;
  const tax = Math.round((subtotal - discount) * 0.13);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const selectedAddress = addresses.find(a => a._id === selectedAddressId);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const { data } = await api.post('/users/addresses', addressForm);
      setAddresses(data.addresses);
      const newest = data.addresses[data.addresses.length - 1];
      setSelectedAddressId(newest._id);
      setShowAddressForm(false);
      setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Nepal', isDefault: false });
      toast.success('Address saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
    setSavingAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      setStep(0);
      return;
    }
    setPlacingOrder(true);
    try {
      // 1. Create the order
      const { data: orderData } = await api.post('/orders', {
        items: cart.items.map(item => ({
          product: item.product?._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        couponCode: cart.couponCode || undefined,
      });
      const order = orderData.order;
      const returnUrl = `${window.location.origin}/payment-response/${paymentMethod}`;

      // 2. Kick off payment based on method
      if (paymentMethod === 'esewa') {
        const { data } = await api.post('/payment/esewa/initiate', {
          orderId: order._id, amount: total, returnUrl,
        });
        redirectToEsewa(data.formAction, data.formData);
        return; // navigating away — don't clear cart yet, verify step does that
      }

      if (paymentMethod === 'khalti') {
        const { data } = await api.post('/payment/khalti/initiate', {
          orderId: order._id, amount: total, returnUrl,
        });
        window.location.href = data.paymentUrl;
        return;
      }

      if (paymentMethod === 'cod') {
        await api.post('/payment/cod', { orderId: order._id });
        await clearCart();
        toast.success('Order placed! Pay on delivery.');
        navigate(`/order-success/${order._id}`);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '1.8rem', fontWeight: 800, color: '#263238', marginBottom: '8px' }}>
        Checkout
      </h1>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= step ? 'linear-gradient(135deg,#66BB6A,#2E7D32)' : '#e2e8f0',
                color: i <= step ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
              }}>
                {i < step ? <FiCheck size={16} /> : i + 1}
              </div>
              <span style={{ color: i <= step ? '#66BB6A' : '#94a3b8', fontWeight: i === step ? 700 : 500, fontSize: '0.9rem' }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: i < step ? '#66BB6A' : '#e2e8f0', minWidth: '30px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* ── STEP 1: Address ── */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-card">
              <h2 style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, fontSize: '1.15rem', color: '#263238', marginBottom: '16px' }}>
                Delivery Address
              </h2>

              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-3 mb-4">
                  {addresses.map(addr => (
                    <label key={addr._id} style={{
                      display: 'flex', gap: '12px', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                      border: selectedAddressId === addr._id ? '2px solid #66BB6A' : '1px solid #e2e8f0',
                      background: selectedAddressId === addr._id ? 'rgba(46,125,50,0.05)' : '#fff',
                    }}>
                      <input type="radio" name="address" checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)} style={{ marginTop: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#263238', fontSize: '0.9rem' }}>{addr.fullName} · {addr.phone}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                          {addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!showAddressForm ? (
                <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#2E7D32' }}>
                  <FiPlus size={16} /> Add new address
                </button>
              ) : (
                <form onSubmit={handleSaveAddress} className="space-y-3 border-t pt-4 mt-2">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input required placeholder="Full name" value={addressForm.fullName}
                      onChange={e => setAddressForm(p => ({ ...p, fullName: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" />
                    <input required placeholder="Phone" value={addressForm.phone}
                      onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <input required placeholder="Street address" value={addressForm.street}
                    onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input required placeholder="City" value={addressForm.city}
                      onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" />
                    <input required placeholder="State/Province" value={addressForm.state}
                      onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" />
                    <input required placeholder="Postal code" value={addressForm.postalCode}
                      onChange={e => setAddressForm(p => ({ ...p, postalCode: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={savingAddress} className="btn-primary text-sm px-5 py-2">
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-card">
              <h2 style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, fontSize: '1.15rem', color: '#263238', marginBottom: '16px' }}>
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'esewa', label: 'eSewa', desc: 'Pay securely via eSewa wallet', icon: '💚' },
                  { key: 'khalti', label: 'Khalti', desc: 'Pay securely via Khalti wallet', icon: '💜' },
                  { key: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                ].map(opt => (
                  <label key={opt.key} style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '12px', cursor: 'pointer',
                    border: paymentMethod === opt.key ? '2px solid #66BB6A' : '1px solid #e2e8f0',
                    background: paymentMethod === opt.key ? 'rgba(46,125,50,0.05)' : '#fff',
                  }}>
                    <input type="radio" name="payment" checked={paymentMethod === opt.key}
                      onChange={() => setPaymentMethod(opt.key)} />
                    <span style={{ fontSize: '22px' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#263238', fontSize: '0.92rem' }}>{opt.label}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-card">
              <h2 style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, fontSize: '1.15rem', color: '#263238', marginBottom: '16px' }}>
                Order Review
              </h2>

              <div className="space-y-3 mb-5">
                {cart.items.map(item => (
                  <div key={item._id} className="flex items-center gap-3 pb-3 border-b last:border-b-0">
                    <img src={item.product?.images?.[0]?.url || 'https://picsum.photos/60/60'} alt={item.product?.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight: 600, color: '#263238', fontSize: '0.88rem' }}>{item.product?.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#263238', fontSize: '0.88rem' }}>{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              {selectedAddress && (
                <div style={{ display: 'flex', gap: '10px', padding: '14px', borderRadius: '12px', background: '#f8faf8', marginBottom: '12px' }}>
                  <FiMapPin size={16} color="#2E7D32" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <strong style={{ color: '#263238' }}>{selectedAddress.fullName}</strong> · {selectedAddress.phone}<br />
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', padding: '14px', borderRadius: '12px', background: '#f8faf8' }}>
                {paymentMethod === 'cod' ? <FiTruck size={16} color="#2E7D32" /> : <FiCreditCard size={16} color="#2E7D32" />}
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Payment via <strong style={{ color: '#263238', textTransform: 'capitalize' }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</strong>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step navigation */}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold" style={{ color: '#263238', borderColor: '#e2e8f0' }}>
                <FiArrowLeft size={16} /> Back
              </button>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !selectedAddress}
                className="flex-1 btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button onClick={handlePlaceOrder} disabled={placingOrder} className="flex-1 btn-primary py-3 text-sm disabled:opacity-60">
                {placingOrder ? 'Placing Order...' : `Place Order · ${formatPrice(total)}`}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-card sticky top-24">
            <h2 style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, fontSize: '1.05rem', color: '#263238', marginBottom: '16px' }}>
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span style={{ color: '#2E7D32' }}>Discount</span><span style={{ color: '#2E7D32' }}>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span style={{ color: shipping === 0 ? '#2E7D32' : undefined }}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax (13%)</span><span>{formatPrice(tax)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg" style={{ color: '#263238' }}>
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;