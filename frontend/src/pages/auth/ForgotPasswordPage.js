import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shopmart-blue to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <FiArrowLeft size={16} /> Back to Login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent!</h2>
            <p className="text-gray-500">Check your inbox for password reset instructions.</p>
            <Link to="/login" className="btn-primary inline-block mt-6">Back to Login</Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
              <p className="text-gray-500 mt-1">Enter your email to reset your password</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
