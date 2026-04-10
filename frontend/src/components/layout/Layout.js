import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';

const Layout = () => {
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const nav = document.querySelector('nav');
      if (nav) setNavHeight(nav.offsetHeight);
    };

    // Small delay to let navbar fully render
    const timer = setTimeout(updateHeight, 50);
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1" style={{ paddingTop: navHeight }}>
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default Layout;