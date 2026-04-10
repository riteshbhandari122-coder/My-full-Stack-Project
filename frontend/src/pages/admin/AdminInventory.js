import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiPackage } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';

const AdminInventory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const { data: res } = await api.get('/admin/inventory');
      setData(res);
    } catch {}
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-20" />)}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900">Inventory Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: data?.stats.totalProducts || 0 },
          { label: 'Total Stock', value: data?.stats.totalStock || 0 },
          { label: 'Avg Stock', value: Math.round(data?.stats.avgStock || 0) },
          { label: 'Total Sold', value: data?.stats.totalSold || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-card">
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Out of Stock */}
      <div className="bg-white rounded-xl shadow-card">
        <div className="p-5 border-b flex items-center gap-2">
          <FiAlertCircle size={18} className="text-red-500" />
          <h3 className="font-bold text-gray-900">Out of Stock ({data?.outOfStock?.length || 0})</h3>
        </div>
        {data?.outOfStock?.length === 0 ? (
          <p className="text-center py-8 text-gray-500">All products are in stock! 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Brand', 'Category', 'Price'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.outOfStock?.map(p => (
                  <tr key={p._id} className="hover:bg-red-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || 'https://picsum.photos/40/40'} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-xl shadow-card">
        <div className="p-5 border-b flex items-center gap-2">
          <FiPackage size={18} className="text-yellow-500" />
          <h3 className="font-bold text-gray-900">Low Stock (less than 10) — {data?.lowStock?.length || 0} products</h3>
        </div>
        {data?.lowStock?.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No low stock products!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Brand', 'Category', 'Stock', 'Price'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.lowStock?.map(p => (
                  <tr key={p._id} className="hover:bg-yellow-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || 'https://picsum.photos/40/40'} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-yellow-600">{p.stock} left</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{formatPrice(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
