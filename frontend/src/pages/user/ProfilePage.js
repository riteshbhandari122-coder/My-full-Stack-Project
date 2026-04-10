import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiLock } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser, updatePassword } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    }
    setChangingPassword(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">My Profile</h1>

      <div className="grid gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)} className="btn-outline flex items-center gap-2 text-sm">
              <FiEdit2 size={14} /> {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field pl-9" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                <FiSave size={14} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="grid gap-3">
              {[
                { icon: FiUser, label: 'Name', value: user?.name },
                { icon: FiMail, label: 'Email', value: user?.email },
                { icon: FiPhone, label: 'Phone', value: user?.phone || 'Not set' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiLock size={16} /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirmPassword' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <input
                  type="password"
                  value={passwordForm[key]}
                  onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
            ))}
            <button type="submit" disabled={changingPassword} className="btn-primary">
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
