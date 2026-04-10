import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { name: '', description: '', icon: '', featured: false, isActive: true, order: 0 };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/categories/${editingId}`, form); toast.success('Category updated!'); }
      else { await api.post('/categories', form); toast.success('Category created!'); }
      setShowForm(false); setEditingId(null); setForm(emptyForm); fetchCategories();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', featured: cat.featured, isActive: cat.isActive, order: cat.order });
    setEditingId(cat._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); toast.success('Deleted'); fetchCategories(); } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900">Categories</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <h3 className="font-bold text-gray-900 mb-4">{editingId ? 'Edit' : 'Add'} Category</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Name', key: 'name' },
              { label: 'Icon (emoji)', key: 'icon', placeholder: '📱' },
              { label: 'Sort Order', key: 'order', type: 'number' },
            ].map(({ label, key, type = 'text', placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} className="input-field" placeholder={placeholder} required={key === 'name'} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="input-field h-20 resize-none" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({...p, featured: e.target.checked}))} /><span className="text-sm">Featured</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.checked}))} /><span className="text-sm">Active</span></label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl p-5 h-28 animate-pulse" />)
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-xl p-5 shadow-card flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon || '📦'}</span>
                <div>
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.description || 'No description'}</p>
                  <div className="flex gap-1 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span>
                    {cat.featured && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Featured</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
