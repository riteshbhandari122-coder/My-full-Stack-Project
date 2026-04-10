import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/helpers';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?page=${page}&limit=10`);
      setOrders(data.orders);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 mb-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <FiPackage size={60} className="text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
      <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
      <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">My Orders ({orders.length})</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getOrderStatusInfo(order.status);
          return (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow block"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                    {statusInfo.label}
                  </span>
                  <FiChevronRight size={16} className="text-gray-400" />
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                {order.items.slice(0, 3).map((item) => (
                  <img key={item._id} src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                ))}
                {order.items.length > 3 && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                <span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
