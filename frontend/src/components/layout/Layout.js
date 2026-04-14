import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import LiveChat from '../common/LiveChat';
import { useTheme } from '../../ThemeContext';

const Layout = () => {
  const [navHeight, setNavHeight] = useState(0);
  const { darkMode } = useTheme();

  useEffect(() => {
    const updateHeight = () => {
      const nav = document.querySelector('nav');
      if (nav) setNavHeight(nav.offsetHeight);
    };
    const timer = setTimeout(updateHeight, 50);
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      <main className="flex-1" style={{ paddingTop: navHeight }}>
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <LiveChat />
    </div>
  );
};

export default Layout;