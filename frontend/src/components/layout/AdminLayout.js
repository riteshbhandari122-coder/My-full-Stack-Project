import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiBarChart2, FiAlertCircle, FiMenu, FiX, FiLogOut, FiBell, FiChevronRight
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: FiGrid,        label: 'Dashboard', to: '/admin',            color: '#f59e0b' },
    { icon: FiPackage,     label: 'Products',  to: '/admin/products',   color: '#3b82f6' },
    { icon: FiShoppingBag, label: 'Orders',    to: '/admin/orders',     color: '#10b981' },
    { icon: FiUsers,       label: 'Users',     to: '/admin/users',      color: '#8b5cf6' },
    { icon: FiTag,         label: 'Categories',to: '/admin/categories', color: '#f97316' },
    { icon: FiAlertCircle, label: 'Inventory', to: '/admin/inventory',  color: '#ef4444' },
    { icon: FiBarChart2,   label: 'Analytics', to: '/admin/analytics',  color: '#06b6d4' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const currentPage = navItems.find((n) => n.to === location.pathname);

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', inset: '0 auto 0 0', zIndex: 50, width: '256px',
        background: 'linear-gradient(180deg, #0f1b2d 0%, #0a1422 100%)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(245,158,11,0.12)',
      }} className="lg:translate-x-0" id="admin-sidebar">

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'Syne, sans-serif' }}>Shop</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', fontFamily: 'Syne, sans-serif' }}>Mart</span>
              <span style={{ fontSize: '0.6rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0f1b2d', padding: '2px 6px', borderRadius: '6px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginLeft: '4px' }}>
                ADMIN
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }} className="lg:hidden">
              <FiX size={20} />
            </button>
          </div>

          {/* Admin user card */}
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245,158,11,0.08)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0f1b2d', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>Administrator</div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          <p style={{ color: '#4b5563', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px 4px', fontFamily: 'Syne, sans-serif' }}>
            Main Menu
          </p>
          {navItems.map(({ icon: Icon, label, to, color }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '12px', marginBottom: '2px',
                textDecoration: 'none', transition: 'all 0.18s',
                background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.6)',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isActive ? `${color}22` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.18s' }}>
                  <Icon size={16} color={isActive ? color : 'currentColor'} />
                </div>
                <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif', flex: 1 }}>{label}</span>
                {isActive && <FiChevronRight size={14} color="#f59e0b" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '4px', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; }}
          >
            ← Back to Store
          </Link>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', color: '#f87171', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column' }} className="lg:ml-64">

        {/* Top Bar */}
        <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#6b7280' }} className="lg:hidden">
              <FiMenu size={22} />
            </button>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Admin</span>
              <FiChevronRight size={14} color="#9ca3af" />
              <span style={{ color: '#111827', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'Syne, sans-serif' }}>
                {currentPage?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notification bell */}
            <button style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: '#6b7280', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#6b7280'; }}
            >
              <FiBell size={18} />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', background: '#ef4444', borderRadius: '50%', border: '1.5px solid white' }} />
            </button>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0f1b2d', fontSize: '0.75rem', fontFamily: 'Syne, sans-serif' }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151', fontFamily: 'DM Sans, sans-serif' }} className="hidden md:block">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        <main style={{ padding: '24px', flex: 1 }}>
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }} className="lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;