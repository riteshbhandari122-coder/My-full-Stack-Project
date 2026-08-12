import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';

const AdminAnalytics = () => {
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [salesRes, custRes] = await Promise.all([
        api.get(`/admin/analytics/sales?period=${period}`),
        api.get('/admin/analytics/customers'),
      ]);
      setSalesData(salesRes.data);
      setCustomerData(custRes.data);
    } catch {}
    setLoading(false);
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {Array(3).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-64" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Analytics</h2>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="font-bold text-gray-900 mb-4">Revenue & Orders Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={salesData?.salesData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val, name) => [name === 'revenue' ? `NPR ${val.toLocaleString()}` : val, name]} />
            <Bar yAxisId="revenue" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar yAxisId="orders" dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Sales */}
      {salesData?.categorySales?.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="font-bold text-gray-900 mb-4">Sales by Category</h3>
          <div className="space-y-3">
            {salesData.categorySales.map((cat, i) => (
              <div key={cat._id} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{cat._id}</span>
                    <span className="text-gray-600">{formatPrice(cat.revenue)} ({cat.unitsSold} units)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(cat.revenue / salesData.categorySales[0].revenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Users & Top Customers */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="font-bold text-gray-900 mb-4">New Users (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={customerData?.newUsers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="font-bold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {customerData?.topCustomers?.slice(0, 5).map((cust, i) => (
              <div key={cust._id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                  {cust.user?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{cust.user?.name}</p>
                  <p className="text-xs text-gray-500">{cust.orderCount} orders</p>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatPrice(cust.totalSpent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
