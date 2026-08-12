import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiStar } from 'react-icons/fi';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const emptyForm = { name: '', description: '', price: '', discountPercentage: 0, category: '', brand: '', stock: '', sku: '', isFeatured: false, isActive: true };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products); setPages(data.pages); setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const fetchCategories = async () => {
    try { const { data } = await api.get('/categories'); setCategories(data.categories); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) { await api.put(`/products/${editingProduct._id}`, form); toast.success('Product updated!'); }
      else { await api.post('/products', form); toast.success('Product created!'); }
      setShowForm(false); setEditingProduct(null); setForm(emptyForm); fetchProducts();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, description: product.description, price: product.price, discountPercentage: product.discountPercentage, category: product.category?._id || '', brand: product.brand, stock: product.stock, sku: product.sku || '', isFeatured: product.isFeatured, isActive: product.isActive });
    setEditingProduct(product); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Deleted'); fetchProducts(); } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">{total} total products</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingProduct(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <h3 className="font-bold text-gray-900 mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="input-field h-24 resize-none" required />
            </div>
            {[
              { label: 'Price (NPR)', key: 'price', type: 'number' },
              { label: 'Discount %', key: 'discountPercentage', type: 'number' },
              { label: 'Stock', key: 'stock', type: 'number' },
              { label: 'Brand', key: 'brand', type: 'text' },
              { label: 'SKU', key: 'sku', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} className="input-field" required={['price', 'stock', 'brand'].includes(key)} />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="input-field" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-4 items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({...p, isFeatured: e.target.checked}))} />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.checked}))} />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editingProduct ? 'Update' : 'Create'} Product</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-card mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="input-field pl-9" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]?.url || 'https://picsum.photos/40/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm max-w-48 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(product.discountedPrice || product.price)}</p>
                      {product.discountPercentage > 0 && <p className="text-xs text-red-500">-{product.discountPercentage}%</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-700'}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {product.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
    </div>
  );
};

export default AdminProducts;
