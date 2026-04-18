import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiBarChart2, FiAlertCircle, FiMenu, FiX, FiLogOut, FiBell
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: FiGrid, label: 'Dashboard', to: '/admin' },
    { icon: FiPackage, label: 'Products', to: '/admin/products' },
    { icon: FiShoppingBag, label: 'Orders', to: '/admin/orders' },
    { icon: FiUsers, label: 'Users', to: '/admin/users' },
    { icon: FiTag, label: 'Categories', to: '/admin/categories' },
    { icon: FiAlertCircle, label: 'Inventory', to: '/admin/inventory' },
    { icon: FiBarChart2, label: 'Analytics', to: '/admin/analytics' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-xl font-black text-yellow-400">Shop</span>
              <span className="text-xl font-black">Mart</span>
              <span className="text-xs bg-yellow-400 text-gray-900 px-1 rounded font-bold ml-1">Admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <nav className="p-4 flex-1">
          {navItems.map(({ icon: Icon, label, to }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white text-sm mb-2">
            ← Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 w-full text-sm"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <FiMenu size={24} />
            </button>
            <h1 className="text-gray-800 font-semibold">
              {navItems.find((n) => n.to === location.pathname)?.label || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <FiBell size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
