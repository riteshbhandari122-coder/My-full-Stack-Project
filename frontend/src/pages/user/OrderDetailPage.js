import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ─── Delivery status → coordinates in Kathmandu ──────────────────────────────
const STATUS_LOCATIONS = {
  placed:           { lat: 27.7172, lng: 85.3240, label: 'Order received at ShopMart warehouse' },
  confirmed:        { lat: 27.7172, lng: 85.3240, label: 'Order confirmed at ShopMart warehouse' },
  packed:           { lat: 27.7089, lng: 85.3200, label: 'Package packed — ready for pickup' },
  shipped:          { lat: 27.7050, lng: 85.3150, label: 'In transit — Kathmandu hub' },
  out_for_delivery: { lat: 27.6950, lng: 85.3100, label: 'Out for delivery — near your area' },
  delivered:        { lat: 27.6900, lng: 85.3050, label: 'Delivered to your address' },
};

// ─── Leaflet Map Component ────────────────────────────────────────────────────
const DeliveryMap = ({ status, address }) => {
  const loc = STATUS_LOCATIONS[status] || STATUS_LOCATIONS['placed'];

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let map = null;

    const initMap = () => {
      if (window.L && document.getElementById('delivery-map')) {
        // Destroy existing map if any
        if (window._deliveryMap) {
          window._deliveryMap.remove();
          window._deliveryMap = null;
        }

        map = window.L.map('delivery-map', { zoomControl: true, scrollWheelZoom: false }).setView([loc.lat, loc.lng], 14);
        window._deliveryMap = map;

        // OpenStreetMap tiles — completely free
        // Satellite base layer
        window.L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { attribution: 'Tiles © Esri', maxZoom: 19 }
        ).addTo(map);

        // Labels overlay on top of satellite
        window.L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { attribution: '', maxZoom: 19, opacity: 0.8 }
        ).addTo(map);

        // Store marker (gold)
        const storeIcon = window.L.divIcon({
          html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);border:3px solid white;box-shadow:0 4px 12px rgba(245,158,11,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;">🏪</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        // Delivery marker (animated pulse)
        const deliveryIcon = window.L.divIcon({
          html: `<div style="position:relative;width:40px;height:40px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.3);animation:pulse 1.5s infinite;"></div>
            <div style="position:absolute;inset:4px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;">🚚</div>
          </div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        // Add store marker — ShopMart HQ (Kathmandu)
        window.L.marker([27.7172, 85.3240], { icon: storeIcon })
          .addTo(map)
          .bindPopup('<b>ShopMart Warehouse</b><br/>Kathmandu, Nepal', { maxWidth: 200 });

        // Add delivery/current location marker
        window.L.marker([loc.lat, loc.lng], { icon: deliveryIcon })
          .addTo(map)
          .bindPopup(`<b>📦 Your Order</b><br/>${loc.label}`, { maxWidth: 200 })
          .openPopup();

        // Draw route line
        window.L.polyline(
          [[27.7172, 85.3240], [loc.lat, loc.lng]],
          { color: '#f59e0b', weight: 3, dashArray: '8 6', opacity: 0.7 }
        ).addTo(map);
      }
    };

    // Load Leaflet JS if not already loaded
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }

    return () => {
      if (window._deliveryMap) {
        window._deliveryMap.remove();
        window._deliveryMap = null;
      }
    };
  }, [status]);

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        #delivery-map .leaflet-control-attribution { font-size: 10px; }
      `}</style>
      <div id="delivery-map" style={{ height: '280px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', zIndex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', padding: '10px 12px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
        <FiMapPin size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 500 }}>{loc.label}</p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
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
    { key: 'placed',           label: 'Order Placed' },
    { key: 'confirmed',        label: 'Confirmed' },
    { key: 'packed',           label: 'Packed' },
    { key: 'shipped',          label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered',        label: 'Delivered' },
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
        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling} className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
            <FiXCircle size={14} /> Cancel Order
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">

          {/* ── Live Tracking Map ── */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin size={16} className="text-blue-500" /> Live Delivery Tracking
              </h2>
              <DeliveryMap status={order.status} address={order.shippingAddress} />
            </div>
          )}

          {/* ── Timeline ── */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiTruck size={16} /> Order Timeline
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

          {/* ── Items ── */}
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

        {/* ── Summary ── */}
        <div className="space-y-4">
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