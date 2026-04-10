import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiHeart, FiBell, FiUser,
  FiMenu, FiLogOut, FiSettings, FiPackage, FiChevronDown
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import api from '../../utils/api';
import { debounce } from '../../utils/helpers';

const logoImg = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTETqm4Iha2bqXdT36TrOq824haCp-U_F9CyA&s";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getCartCount, fetchCart } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
      fetchNotifications();
    }
    fetchCategories();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories?parent=root');
      setCategories(data.categories?.slice(0, 8) || []);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=5');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  const fetchSuggestions = debounce(async (query) => {
    if (query.length < 2) { setSuggestions([]); return; }
    try {
      const { data } = await api.get(`/products/search/suggestions?q=${query}`);
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch {}
  }, 300);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const cartCount = getCartCount();

  const dropdownVariants = {
    hidden:  { opacity: 0, y: 8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.14 } },
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-navbar' : ''}`}>

      {/* ── Top Promo Bar ── */}
      <div className="navbar-top-bar py-1.5 px-4 text-center hidden md:block">
        <p className="text-xs text-white/70 tracking-wide">
          🎉 Free shipping on orders over{' '}
          <span className="text-white font-medium">NPR 2,000</span>
          {'  ·  '}
          Use code{' '}
          <span className="text-yellow-400 font-bold tracking-widest bg-yellow-400/10 px-1.5 py-0.5 rounded">
            SAVE10
          </span>{' '}
          for 10% off
        </p>
      </div>

      {/* ── Main Navbar ── */}
      <div className="navbar-main px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-4">

          {/* ✅ Circular Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group" aria-label="ShopMart home">
            <div className="logo-circle">
              <img
                src={logoImg}
                alt="ShopMart"
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span
              className="hidden lg:block text-white font-black text-lg leading-none"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}
            >
              Shop<span style={{ color: '#f59e0b' }}>Mart</span>
            </span>
          </Link>

          {/* ── Search Bar ── */}
          <div className="flex-1 hidden md:block relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex h-10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search products, brands, categories…"
                className="nav-search-input"
              />
              <button type="submit" className="nav-search-btn">
                <FiSearch size={18} />
              </button>
            </form>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden" animate="visible" exit="exit"
                  className="absolute top-full left-0 right-0 dropdown-panel bg-white z-50 mt-2"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggestions</span>
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => {
                        navigate(`/products/${s.slug || s._id}`);
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-amber-50/60 text-left transition-colors duration-100 border-b border-gray-50 last:border-0"
                    >
                      {s.image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{s.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.brand} · {s.category}</p>
                      </div>
                      <FiSearch size={13} className="ml-auto text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1">

            {/* Mobile search toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="nav-action-btn md:hidden"
              aria-label="Search"
            >
              <FiSearch size={21} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="nav-action-btn relative" aria-label="Wishlist">
              <FiHeart size={21} />
              <span className="label hidden md:block">Wishlist</span>
              {wishlist?.length > 0 && (
                <span className="nav-badge nav-badge-red">{wishlist.length}</span>
              )}
            </Link>

            {/* Notifications */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="nav-action-btn relative"
                  aria-label="Notifications"
                >
                  <FiBell size={21} />
                  <span className="label hidden md:block">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="nav-badge nav-badge-red">{unreadCount}</span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className="absolute right-0 top-full mt-3 w-80 dropdown-panel bg-white z-50 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-amber-50/40' : ''}`}>
                            <p className="text-sm font-semibold text-gray-800 inline">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Cart */}
            <Link to="/cart" className="nav-action-btn relative" aria-label="Cart">
              <FiShoppingCart size={21} />
              <span className="label hidden md:block">Cart</span>
              {cartCount > 0 && (
                <span className="nav-badge nav-badge-yellow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-150 hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.88)' }}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-400/60">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-gray-900 font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block text-left leading-tight">
                    <p className="text-[10px] text-white/45 font-medium">Hello,</p>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {user.name?.split(' ')[0]}
                    </p>
                  </div>
                  <FiChevronDown
                    size={13}
                    className={`hidden md:block opacity-60 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className="absolute right-0 top-full mt-3 w-56 dropdown-panel bg-white z-50 py-1.5"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                          {user.name}
                        </p>
                      </div>
                      {[
                        { to: '/profile',  icon: <FiUser size={15} />,    label: 'My Profile' },
                        { to: '/orders',   icon: <FiPackage size={15} />, label: 'My Orders' },
                        { to: '/wishlist', icon: <FiHeart size={15} />,   label: 'Wishlist' },
                      ].map(({ to, icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-100 text-sm"
                        >
                          <span className="text-gray-400">{icon}</span>
                          {label}
                        </Link>
                      ))}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-amber-600 hover:bg-amber-50 transition-colors duration-100 text-sm font-semibold"
                        >
                          <FiSettings size={15} />
                          Admin Panel
                        </Link>
                      )}
                      <div className="my-1 border-t border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors duration-100 text-sm"
                      >
                        <FiLogOut size={15} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="nav-action-btn hidden md:flex" aria-label="Sign in">
                  <FiUser size={21} />
                  <span className="label">Sign In</span>
                </Link>
                <Link to="/register" className="hidden md:inline-flex btn-primary text-sm !py-1.5 !px-4">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2 } }}
              exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }}
              onSubmit={handleSearch}
              className="mt-3 flex md:hidden overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="nav-search-input"
                autoFocus
              />
              <button type="submit" className="nav-search-btn">
                <FiSearch size={17} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* ── Categories Bar ── */}
      <div className="navbar-categories hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-1.5">
          <Link to="/products" className="cat-link flex items-center gap-1.5 font-semibold !text-white/80 hover:!text-white">
            <FiMenu size={13} />
            All
          </Link>
          <span className="w-px h-4 bg-white/10 mx-1" />
          {categories.map((cat) => (
            <Link key={cat._id} to={`/category/${cat.slug}`} className="cat-link">
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </Link>
          ))}
          <span className="w-px h-4 bg-white/10 mx-1" />
          <Link to="/products?sort=popular" className="cat-link !text-amber-400 hover:!text-amber-300 font-semibold hover:bg-amber-400/10">
            🔥 Hot Deals
          </Link>
          <Link to="/products?sort=newest" className="cat-link !text-emerald-400 hover:!text-emerald-300 font-semibold hover:bg-emerald-400/10">
            ✨ New Arrivals
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;