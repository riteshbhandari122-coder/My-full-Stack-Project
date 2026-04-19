import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiTag, FiShield, FiChevronRight } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

// Real Payment Logos
const EsewaLogo = () => (
  <img
    src="https://esewa.com.np/common/images/esewa_logo.png"
    alt="eSewa"
    className="h-8 object-contain"
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }}
  />
);

const KhaltiLogo = () => (
  <img
    src="https://web.khalti.com/static/img/logo1.png"
    alt="Khalti"
    className="h-8 object-contain"
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }}
  />
);

const paymentMethods = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    desc: 'Pay when you receive your order',
    logo: null,
    emoji: '💵',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    selectedBorder: 'border-green-500',
    selectedBg: 'bg-green-50',
  }
  {
    value: 'khalti',
    label: 'Khalti',
    desc: 'Fast & secure digital payments',
    logoUrl: 'https://web.khalti.com/static/img/logo1.png',
    fallbackColor: '#5C2D91',
    fallbackText: 'Khalti',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    selectedBorder: 'border-purple-500',
    selectedBg: 'bg-purple-50',
  },
  {
    value: 'stripe',
    label: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, American Express',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    fallbackColor: '#635BFF',
    fallbackText: 'Card',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    selectedBorder: 'border-blue-500',
    selectedBg: 'bg-blue-50',
  },
];

const PaymentLogo = ({ method }) => {
  const [imgError, setImgError] = useState(false);

  if (method.value === 'cod') {
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-md">
        💵
      </div>
    );
  }

  if (imgError) {
    return (
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md"
        style={{ backgroundColor: method.fallbackColor }}
      >
        {method.fallbackText}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-1 shadow-sm">
      <img
        src={method.logoUrl}
        alt={method.label}
        className="w-full h-full object-contain"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nepal',
  });

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
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

      // Handle different payment methods
      if (paymentMethod === 'khalti') {
        handleKhaltiPayment(data.order._id, total);
      } else {
        navigate(`/order-success/${data.order._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    }
    setLoading(false);
  };

  const handleKhaltiPayment = async (orderId, amount) => {
    try {
      const { data } = await api.post('/payment/khalti/initiate', {
        orderId,
        amount: amount * 100,
        returnUrl: `${window.location.origin}/order-success/${orderId}`,
      });
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err) {
      toast.error('Khalti payment failed');
    }
  };

  const selectedPayment = paymentMethods.find((m) => m.value === paymentMethod);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step >= s ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-200'}`}>
                {step > s ? '✓' : s}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {['Address', 'Payment', 'Review'][s - 1]}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <FiTruck size={18} className="text-primary-600" /> Delivery Address
              </h2>
              {user?.addresses?.length > 0 && (
                <div className="space-y-3 mb-4">
                  {user.addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} className="mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">{addr.fullName}</p>
                        <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-sm text-gray-600">{addr.phone}</p>
                        {addr.isDefault && <span className="text-xs text-green-600 font-medium">✓ Default</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {!selectedAddress && (
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
                      <input value={newAddress[key]} onChange={(e) => setNewAddress((p) => ({ ...p, [key]: e.target.value }))} className="input-field" />
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(2)} className="btn-primary mt-4 w-full flex items-center justify-center gap-2">
                Continue to Payment <FiChevronRight />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-6">Choose Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? `${method.selectedBorder} ${method.selectedBg} shadow-sm`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="hidden"
                    />

                    {/* Logo */}
                    <PaymentLogo method={method} />

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>

                    {/* Selected indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === method.value ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === method.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Card logos row */}
              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
                  <FiShield className="text-blue-500" size={18} />
                  <div className="flex gap-2 items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-5 object-contain" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain" />
                    <span className="text-xs text-blue-600 font-medium ml-1">Secured by Stripe</span>
                  </div>
                </div>
              )}

{paymentMethod === 'khalti' && (
                <div className="mt-4 p-3 bg-purple-50 rounded-xl flex items-center gap-2">
                  <span className="text-purple-600 text-xs font-medium">✓ You will be redirected to Khalti to complete payment</span>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Review Order <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Review</h2>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://picsum.photos/60/60'}
                      alt={item.product?.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Payment method selected */}
              <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 mb-4">
                <PaymentLogo method={selectedPayment} />
                <div>
                  <p className="text-xs text-gray-500">Payment via</p>
                  <p className="font-semibold text-sm text-gray-900">{selectedPayment?.label}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline">Back</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    `Place Order • ${formatPrice(total)}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-fit sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (13%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <FiShield size={14} />
            <span>Secure & encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;