import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const countries = [
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: `${selectedCountry.code}${form.phone}`,
      });
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shopmart-blue to-gray-800 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1 mb-4">
            <span className="text-3xl font-black text-yellow-500">Shop</span>
            <span className="text-3xl font-black text-gray-900">Mart</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Join ShopMart today!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Enter your full name"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Enter your email"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          {/* Phone with Country Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
            <div className="flex gap-2">
              {/* Country selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryList(!showCountryList)}
                  className="flex items-center gap-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-gray-300 bg-white h-full min-w-[90px]"
                >
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>

                {/* Dropdown */}
                {showCountryList && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 max-h-64 overflow-hidden">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-48">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryList(false);
                            setCountrySearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left ${
                            selectedCountry.code === country.code ? 'bg-primary-50' : ''
                          }`}
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm text-gray-700">{country.name}</span>
                          <span className="text-xs text-gray-400 ml-auto">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone input */}
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="9800000000"
                className="input-field flex-1"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min. 6 characters"
                className="input-field pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat your password"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;