import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiTag } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', postalCode: '', country: 'Nepal' });

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [user]);

  if (!cart || cart.items?.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 2000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.13);
  const discount = cart.discountAmount || 0;
  const total = subtotal + shipping + tax - discount;

  const handlePlaceOrder = async () => {
    const shippingAddress = selectedAddress || newAddress;
    if (!shippingAddress.street || !shippingAddress.city) {
      toast.error('Please provide a valid shipping address');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress,
        paymentMethod,
        couponCode: cart.couponCode,
      });
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step >= s ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>{s}</div>
              <span className="text-sm font-medium hidden sm:block">{['Address', 'Payment', 'Review'][s - 1]}</span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <FiTruck size={18} /> Delivery Address
              </h2>

              {user?.addresses?.length > 0 && (
                <div className="space-y-3 mb-4">
                  {user.addresses.map((addr) => (
                    <label key={addr._id} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer ${selectedAddress?._id === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} className="mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">{addr.fullName}</p>
                        <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-sm text-gray-600">{addr.phone}</p>
                        {addr.isDefault && <span className="text-xs text-green-600 font-medium">Default</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!selectedAddress && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Enter new address:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Full Name', key: 'fullName', col: 'full' },
                      { label: 'Phone', key: 'phone', col: 'full' },
                      { label: 'Street', key: 'street', col: 'full' },
                      { label: 'City', key: 'city' },
                      { label: 'State', key: 'state' },
                      { label: 'Postal Code', key: 'postalCode' },
                    ].map(({ label, key, col }) => (
                      <div key={key} className={col === 'full' ? 'sm:col-span-2' : ''}>
                        <label className="text-sm text-gray-600 mb-1 block">{label}</label>
                        <input value={newAddress[key]} onChange={e => setNewAddress(p => ({...p, [key]: e.target.value}))} className="input-field" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setStep(2)} className="btn-primary mt-4 w-full">Continue to Payment</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <FiCreditCard size={18} /> Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
                  { value: 'khalti', label: 'Khalti', icon: '📱', desc: 'Pay via Khalti wallet' },
                  { value: 'stripe', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, MasterCard, etc.' },
                ].map(({ value, label, icon, desc }) => (
                  <label key={value} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${paymentMethod === value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Review</h2>
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={item.product?.images?.[0]?.url || 'https://picsum.photos/60/60'} alt={item.product?.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : `Place Order • ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-5 shadow-card h-fit sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax (13%)</span><span>{formatPrice(tax)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
