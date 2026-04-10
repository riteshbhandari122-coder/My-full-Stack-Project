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
    { icon: FiHome, label: 'Home', to: '/' },
    { icon: FiGrid, label: 'Shop', to: '/products' },
    { icon: FiShoppingCart, label: 'Cart', to: '/cart', badge: cartCount },
    { icon: FiHeart, label: 'Wishlist', to: user ? '/wishlist' : '/login' },
    { icon: FiUser, label: user ? 'Profile' : 'Login', to: user ? '/profile' : '/login' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, to, badge }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 relative ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
