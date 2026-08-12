import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const MobileNav = () => {
  const location = useLocation();
  const { getCartCount } = useCartStore();
  const { user } = useAuthStore();
  const cartCount = getCartCount();

  const navItems = [
    { icon: FiHome,         label: 'Home',       to: '/' },
    { icon: FiGrid,         label: 'Shop',       to: '/products' },
    { icon: null,           label: 'Rewards',    to: '/rewards', emoji: '🌿' },
    { icon: null,           label: 'AI Upcycle', to: '/know-how-to-recycle', emoji: '📷' },
    { icon: FiShoppingCart, label: 'Cart',       to: '/cart', badge: cartCount },
    { icon: FiUser,         label: user ? 'Profile' : 'Login', to: user ? '/profile' : '/login' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'linear-gradient(180deg, #0d2818 0%, #08190f 100%)',
        borderTop: '1px solid rgba(46,125,50,0.18)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.35)',
        display: 'flex',
      }}
      className="md:hidden" // ✅ Automatically hides bottom nav on PC/Laptop screens
    >
      {navItems.map(({ icon: Icon, label, to, badge, emoji }) => {
        const isActive = location.pathname === to;
        const isCustomEmoji = emoji !== undefined;

        return (
          <Link
            key={to}
            to={to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px 1px 4px',
              gap: '2px',
              position: 'relative',
              color: isActive ? '#66BB6A' : 'rgba(255,255,255,0.5)',
              transition: 'color 0.18s',
              textDecoration: 'none',
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '15%',
                  right: '15%',
                  height: '2px',
                  borderRadius: '0 0 4px 4px',
                  background: 'linear-gradient(90deg,#66BB6A,#2E7D32)',
                  boxShadow: '0 0 8px rgba(46,125,50,0.6)',
                }}
              />
            )}
            <div
              style={{
                position: 'relative',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isCustomEmoji ? (
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isActive
                      ? 'linear-gradient(135deg,#66BB6A,#2E7D32)'
                      : 'rgba(102,187,106,0.15)',
                    border: '1.5px solid #66BB6A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    lineHeight: 1,
                  }}
                >
                  {emoji}
                </div>
              ) : (
                <Icon size={18} />
              )}
              {badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-7px',
                    minWidth: '15px',
                    height: '15px',
                    borderRadius: '99px',
                    background: 'linear-gradient(135deg,#4ade80,#66BB6A)',
                    color: '#0d2818',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #0d2818',
                  }}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '0.55rem',
                fontWeight: isCustomEmoji ? 700 : 500,
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;