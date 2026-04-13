import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiPackage, FiTruck, FiCheckCircle, FiXCircle,
  FiMapPin, FiClock, FiPhone, FiShare2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const trackingSteps = [
  { key: 'placed',           label: 'Order Placed',      icon: '📋', desc: 'Your order has been received' },
  { key: 'confirmed',        label: 'Confirmed',          icon: '✅', desc: 'Order confirmed by seller' },
  { key: 'packed',           label: 'Packed',             icon: '📦', desc: 'Your items are packed' },
  { key: 'shipped',          label: 'Shipped',            icon: '🚚', desc: 'Order is on the way' },
  { key: 'out_for_delivery', label: 'Out for Delivery',   icon: '🛵', desc: 'Arriving today!' },
  { key: 'delivered',        label: 'Delivered',          icon: '🎉', desc: 'Enjoy your purchase!' },
];

const StatusBadge = ({ status }) => {
  const colors = {
    placed:           'bg-blue-100 text-blue-700',
    confirmed:        'bg-indigo-100 text-indigo-700',
    packed:           'bg-yellow-100 text-yellow-700',
    shipped:          'bg-orange-100 text-orange-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered:        'bg-green-100 text-green-700',
    cancelled:        'bg-red-100 text-red-700',
    returned:         'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
    } catch {
      toast.error('Order not found');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.message);
    }
    setCancelling(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order #${order.orderNumber}`,
        text: `Track my ShopMart order #${order.orderNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 mb-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );

  if (!order) return null;

  const currentStep = trackingSteps.findIndex(s => s.key === order.status);
  const canCancel = !['shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.status);
  const progressPercent = order.status === 'cancelled' ? 0 :
    ((currentStep) / (trackingSteps.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/orders" className="text-sm text-primary-600 hover:underline mb-1 block">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-black text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <FiShare2 size={14} /> Share
          </button>
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="border border-red-300 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <FiXCircle size={14} />
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">

          {/* Tracking Card */}
          {order.status !== 'cancelled' ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiTruck size={18} className="text-primary-600" />
                Live Order Tracking
              </h2>

              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">Order Placed</span>
                  <span className="text-xs text-green-600 font-medium">{Math.round(progressPercent)}% Complete</span>
                  <span className="text-xs text-gray-400">Delivered</span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-0">
                {trackingSteps.map((step, i) => {
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const historyEntry = order.trackingHistory?.find(h => h.status === step.key);

                  return (
                    <div key={step.key} className="flex gap-4">
                      {/* Line + Circle */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10
                            ${isDone ? 'bg-green-500 shadow-md shadow-green-200' :
                              isCurrent ? 'bg-primary-500 shadow-md shadow-primary-200' :
                              'bg-gray-100'}`}
                        >
                          {isDone ? (
                            isCurrent ? step.icon : <FiCheckCircle className="text-white" size={18} />
                          ) : (
                            <span className="text-gray-400 text-sm">{i + 1}</span>
                          )}
                        </motion.div>
                        {i < trackingSteps.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-6 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-sm ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </p>
                          {historyEntry && (
                            <span className="text-xs text-gray-400">
                              {formatDate(historyEntry.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isDone ? 'text-gray-500' : 'text-gray-300'}`}>
                          {historyEntry?.message || step.desc}
                        </p>
                        {historyEntry?.location && (
                          <p className="text-xs text-primary-600 mt-0.5 flex items-center gap-1">
                            <FiMapPin size={10} /> {historyEntry.location}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Delivery */}
              {order.estimatedDelivery && order.status !== 'delivered' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                  <FiClock className="text-blue-500" size={20} />
                  <div>
                    <p className="text-xs text-blue-500 font-medium">Estimated Delivery</p>
                    <p className="text-sm font-bold text-blue-700">
                      {formatDate(order.estimatedDelivery)}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivered celebration */}
              {order.status === 'delivered' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-50 rounded-xl text-center"
                >
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="font-bold text-green-700">Order Delivered!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Delivered on {formatDate(order.deliveredAt)}
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                  ❌
                </div>
                <div>
                  <p className="font-bold text-red-700">Order Cancelled</p>
                  <p className="text-sm text-red-500 mt-0.5">
                    {order.cancelReason || 'Cancelled by customer'}
                  </p>
                  {order.cancelledAt && (
                    <p className="text-xs text-red-400 mt-1">
                      {formatDate(order.cancelledAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage size={16} className="text-primary-600" />
              Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                    {item.color && <p className="text-xs text-gray-400">Color: {item.color}</p>}
                    {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                  </div>
                  <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiMapPin size={15} className="text-primary-600" />
              Delivery Address
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.postalCode}</p>
              <p className="font-medium text-gray-700 flex items-center gap-1 mt-2">
                <FiPhone size={12} /> {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Payment Details</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                  {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={order.shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                  {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (13%)</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-2">Need Help? 💬</h3>
            <p className="text-xs text-white/80 mb-3">
              Have an issue with your order? Contact us!
            </p>
            
              href="https://wa.me/9779800000000"
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-white text-primary-600 font-bold text-sm py-2 rounded-xl text-center hover:bg-gray-50 transition"
            >
              💬 WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;