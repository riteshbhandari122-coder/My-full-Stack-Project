import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password reset successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shopmart-blue to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-1">Enter your new password</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['New Password', password, setPassword], ['Confirm Password', confirmPassword, setConfirmPassword]].map(([label, val, setter]) => (
            <div key={label}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" value={val} onChange={e => setter(e.target.value)} className="input-field pl-10" required minLength={6} />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
