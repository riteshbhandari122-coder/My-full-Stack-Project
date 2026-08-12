import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiPackage, FiShoppingBag, FiDollarSign,
  FiTrendingUp, FiAlertCircle, FiEye, FiStar
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await api.get('/admin/dashboard');
      setData(res);
    } catch {}
    setLoading(false);
  };

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-xl h-24" />
      ))}
    </div>
  );

  if (!data) return null;

  const statCards = [
    { label: 'Total Users', value: data.stats.totalUsers, icon: FiUsers, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Total Products', value: data.stats.totalProducts, icon: FiPackage, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Total Orders', value: data.stats.totalOrders, icon: FiShoppingBag, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' },
    { label: 'Total Revenue', value: formatPrice(data.stats.totalRevenue), icon: FiDollarSign, color: 'green', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Monthly Revenue', value: formatPrice(data.stats.monthlyRevenue), icon: FiTrendingUp, color: 'teal', bg: 'bg-teal-50', text: 'text-teal-600' },
    { label: 'Pending Orders', value: data.stats.pendingOrders, icon: FiAlertCircle, color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { label: 'Delivered', value: data.stats.deliveredOrders, icon: FiShoppingBag, color: 'green', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Categories', value: data.stats.totalCategories, icon: FiPackage, color: 'pink', bg: 'bg-pink-50', text: 'text-pink-600' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={20} className={text} />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="font-bold text-gray-900 mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`NPR ${val.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="font-bold text-gray-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.orderStatusDist}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ _id, count }) => `${_id} (${count})`}
              >
                {data.orderStatusDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Top Selling Products</h3>
            <Link to="/admin/products" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {data.topProducts.map((product, i) => (
              <div key={product._id} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm font-bold w-5">{i + 1}</span>
                <img src={product.images?.[0]?.url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <div className="flex items-center gap-1">
                    <FiStar size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-500">{product.ratings} • {product.sold} sold</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatPrice(product.discountedPrice || product.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  {order.user?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatPrice(order.totalPrice)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
