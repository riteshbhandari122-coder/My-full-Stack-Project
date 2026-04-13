import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

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
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.message);
    }
    setCancelling(false);
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-center">Loading...</div>;
  if (!order) return null;

  const statusInfo = getOrderStatusInfo(order.status);
  const canCancel = !['shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.status);

  const trackingSteps = [
    { key: 'placed', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStep = trackingSteps.findIndex(s => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/orders" className="text-sm text-primary-600 hover:underline mb-1 block">← Back to Orders</Link>
          <h1 className="text-2xl font-black text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
              <FiXCircle size={14} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-4">
          {/* Tracking Timeline */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiTruck size={16} /> Order Tracking
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                {trackingSteps.map((step, i) => {
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.key} className="relative flex items-center gap-4 pb-4">
                      <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        isDone ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                      } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}>
                        {isDone ? <FiCheckCircle size={14} /> : <span className="text-xs">{i + 1}</span>}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        {isCurrent && <p className="text-xs text-green-600 font-medium">Current Status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage size={16} /> Items ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.postalCode}</p>
              <p className="font-medium mt-1">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-bold text-gray-900 mb-3">Payment Details</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium capitalize">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span>
              </div>
              <hr />
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span><span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;