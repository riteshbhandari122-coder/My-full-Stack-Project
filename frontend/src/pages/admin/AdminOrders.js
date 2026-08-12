import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice, formatDate, getOrderStatusInfo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => { fetchOrders(); }, [page, search, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const { data } = await api.get(`/orders/admin/all?${params}`);
      setOrders(data.orders); setPages(data.pages); setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId) => {
    if (!newStatus) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, message: statusMessage });
      toast.success('Order status updated!');
      setSelectedOrder(null); setNewStatus(''); setStatusMessage('');
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };

  const statuses = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Orders</h2>
          <p className="text-gray-500 text-sm">{total} total orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-card mb-4 flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order number..." className="input-field pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded" /></td>)}
                  </tr>
                ))
              ) : orders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.status);
                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900">#{order.orderNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{order.user?.name}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} items</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatPrice(order.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelectedOrder(order); setNewStatus(order.status); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <FiEdit2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="p-4 flex gap-2 justify-center">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Update Order Status</h3>
            <p className="text-sm text-gray-500 mb-4">Order #{selectedOrder.orderNumber}</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field">
                  {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status Message</label>
                <input value={statusMessage} onChange={e => setStatusMessage(e.target.value)} placeholder="e.g. Your order is packed and ready to ship" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleUpdateStatus(selectedOrder._id)} className="btn-primary flex-1">Update Status</button>
              <button onClick={() => setSelectedOrder(null)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
