import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const MobileNav = () => {
  const location = useLocation();
  const { getCartCount } = useCartStore();
  const { user } = useAuthStore();
  const cartCount = getCartCount();

  const navItems = [
    { icon: FiHome,         label: 'Home',    to: '/' },
    { icon: FiGrid,         label: 'Shop',    to: '/products' },
    { icon: FiShoppingCart, label: 'Cart',    to: '/cart', badge: cartCount },
    { icon: FiHeart,        label: 'Wishlist', to: user ? '/wishlist' : '/login' },
    { icon: FiUser,         label: user ? 'Profile' : 'Login', to: user ? '/profile' : '/login' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'linear-gradient(180deg, #0f1b2d 0%, #0a1422 100%)',
      borderTop: '1px solid rgba(245,158,11,0.18)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.35)',
      display: 'flex',
    }} className="md:hidden">

      {/* Regular nav items — first 2 */}
      {navItems.slice(0, 2).map(({ icon: Icon, label, to, badge }) => {
        const isActive = location.pathname === to;
        return (
          <Link key={to} to={to} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px 4px 8px', gap: '3px', position: 'relative',
            color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.18s', textDecoration: 'none',
          }}>
            {isActive && <span style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px', borderRadius: '0 0 4px 4px', background: 'linear-gradient(90deg,#f59e0b,#d97706)', boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />}
            <div style={{ position: 'relative' }}>
              <Icon size={21} />
              {badge > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-7px', minWidth: '15px', height: '15px', borderRadius: '99px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f1b2d', fontSize: '0.58rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #0f1b2d' }}>{badge > 9 ? '9+' : badge}</span>}
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
          </Link>
        );
      })}

      {/* Center Spin & Win button */}
      <Link to="/spin" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '6px 4px 8px', gap: '2px',
        textDecoration: 'none', position: 'relative',
      }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: location.pathname === '/spin'
            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
            : 'linear-gradient(135deg,#1a2d45,#0f1b2d)',
          border: '2.5px solid #f59e0b',
          boxShadow: '0 0 14px rgba(245,158,11,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
          marginTop: '-18px',
        }}>
          🎰
        </div>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em' }}>
          Spin
        </span>
      </Link>

      {/* Regular nav items — last 2 */}
      {navItems.slice(2).map(({ icon: Icon, label, to, badge }) => {
        const isActive = location.pathname === to;
        return (
          <Link key={to} to={to} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px 4px 8px', gap: '3px', position: 'relative',
            color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.18s', textDecoration: 'none',
          }}>
            {isActive && <span style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px', borderRadius: '0 0 4px 4px', background: 'linear-gradient(90deg,#f59e0b,#d97706)', boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />}
            <div style={{ position: 'relative' }}>
              <Icon size={21} />
              {badge > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-7px', minWidth: '15px', height: '15px', borderRadius: '99px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0f1b2d', fontSize: '0.58rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #0f1b2d' }}>{badge > 9 ? '9+' : badge}</span>}
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;