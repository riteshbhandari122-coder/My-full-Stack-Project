import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AddressesPage = () => {
  const { user, updateUser } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Nepal', isDefault: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data;
      if (editingId) {
        const res = await api.put(`/users/addresses/${editingId}`, form);
        data = res.data;
      } else {
        const res = await api.post('/users/addresses', form);
        data = res.data;
      }
      updateUser({ addresses: data.addresses });
      toast.success(editingId ? 'Address updated!' : 'Address added!');
      setShowForm(false);
      setEditingId(null);
      setForm({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Nepal', isDefault: false });
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const { data } = await api.delete(`/users/addresses/${addressId}`);
      updateUser({ addresses: data.addresses });
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (address) => {
    setForm(address);
    setEditingId(address._id);
    setShowForm(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">My Addresses</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Address
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'fullName', col: 'full' },
              { label: 'Phone', key: 'phone', col: 'full' },
              { label: 'Street Address', key: 'street', col: 'full' },
              { label: 'City', key: 'city' },
              { label: 'State/Province', key: 'state' },
              { label: 'Postal Code', key: 'postalCode' },
              { label: 'Country', key: 'country' },
            ].map(({ label, key, col }) => (
              <div key={key} className={col === 'full' ? 'sm:col-span-2' : ''}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <input
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
                <span className="text-sm text-gray-700">Set as default address</span>
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Address'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {user?.addresses?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-card">
          <FiMapPin size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No addresses saved yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {user?.addresses?.map((addr) => (
            <div key={addr._id} className="bg-white rounded-xl p-5 shadow-card flex items-start justify-between">
              <div className="flex gap-3">
                <FiMapPin size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{addr.fullName}</p>
                    {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600">{addr.street}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-sm text-gray-600">{addr.country}</p>
                  <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(addr)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <FiEdit2 size={16} />
                </button>
                <button onClick={() => handleDelete(addr._id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
