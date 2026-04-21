import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTruck, FiShield, FiRotateCcw, FiHeadphones, FiZap, FiStar, FiPackage, FiClock } from 'react-icons/fi';
import ProductGrid from '../components/product/ProductGrid';
import api from '../utils/api';

// ─── Flash Deals Countdown Timer ─────────────────────────────────────────────
const CountdownTimer = () => {
  const getTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    const diff = midnight - now;
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };

  const [time, setTime] = useState(getTimeLeft());
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <FiClock size={14} style={{ color: 'white', opacity: 0.8 }} />
      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Ends in</span>
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <React.Fragment key={i}>
          <div style={{
            background: 'rgba(0,0,0,0.35)', borderRadius: '8px',
            padding: '4px 10px', minWidth: '38px', textAlign: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1.1rem', color: 'white',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>{val}</div>
          {i < 2 && <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};



const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, topRatedRes, dealsRes, catsRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/top-rated'),
          api.get('/products/deals'),
          api.get('/categories?featured=true'),
        ]);
        setFeatured(featuredRes.data.products);
        setTopRated(topRatedRes.data.products);
        setDeals(dealsRes.data.products);
        setCategories(catsRes.data.categories);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const features = [
    { icon: FiTruck,       title: 'Free Delivery',  desc: 'On orders over NPR 2000' },
    { icon: FiShield,      title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: FiRotateCcw,   title: 'Easy Returns',   desc: '30-day return policy' },
    { icon: FiHeadphones,  title: '24/7 Support',   desc: 'Dedicated customer support' },
  ];

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="hero-section relative overflow-hidden">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="hero-pill mb-6 inline-flex">
                <FiZap size={14} className="inline mr-1" />
                Up to 60% OFF — Limited Time
              </span>
              <h1 className="hero-title mt-6 mb-4">
                Shop <span className="hero-highlight">Smart</span>,{' '}
                Shop <span className="hero-highlight">Big!</span>
              </h1>
              <p className="hero-subtitle mb-10">
                Discover thousands of products across 100+ categories.<br />
                Best prices, fast delivery, and hassle-free returns.
              </p>
              <div className="flex gap-4 justify-center flex-wrap mb-14">
                <Link to="/products" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                  Shop Now <FiArrowRight />
                </Link>
                <Link to="/products?sort=popular" className="btn-outline text-base px-8 py-3 flex items-center gap-2">
                  View Deals <FiZap />
                </Link>
              </div>
              <div className="hero-stats">
                {[
                  { num: '20K+', label: 'Products', icon: FiPackage },
                  { num: '500+', label: 'Brands', icon: FiStar },
                  { num: '50K+', label: 'Customers', icon: FiShield },
                ].map(({ num, label, icon: Icon }) => (
                  <div key={label} className="hero-stat-item">
                    <Icon size={20} className="hero-stat-icon" />
                    <p className="hero-stat-num">{num}</p>
                    <p className="hero-stat-label">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Bar ── */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Shop by Category</h2>
                <p className="text-gray-500 text-sm mt-1">Browse 100+ product categories</p>
              </div>
              <Link to="/products" className="text-amber-600 font-medium flex items-center gap-1 text-sm hover:gap-2 transition-all">
                View All <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <Link key={cat._id} to={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-2 p-3 bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-1">
                  <span className="text-3xl">{cat.icon || '🛍️'}</span>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Flash Deals Banner with Countdown ── */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="deals-banner rounded-2xl p-6 md:p-8">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Top row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black" style={{ color: 'white' }}>⚡ Flash Deals</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Limited time offers — Don't miss out!</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <CountdownTimer />
                  <Link to="/products?sort=popular" className="deals-banner-btn bg-white font-bold px-6 py-3 rounded-xl hover:bg-opacity-90 transition-colors flex items-center gap-2 whitespace-nowrap">
                    Shop Deals <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">✨ Featured Products</h2>
              <p className="text-gray-500 text-sm mt-1">Handpicked products just for you</p>
            </div>
            <Link to="/products" className="text-amber-600 font-medium flex items-center gap-1 text-sm hover:gap-2 transition-all">
              View All <FiArrowRight size={16} />
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} cols={4} />
        </div>
      </section>

      {/* ── Top Rated ── */}
      {topRated.length > 0 && (
        <section className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">⭐ Top Rated</h2>
                <p className="text-gray-500 text-sm mt-1">Loved by our customers</p>
              </div>
              <Link to="/products?sort=rating" className="text-amber-600 font-medium flex items-center gap-1 text-sm hover:gap-2 transition-all">
                View All <FiArrowRight size={16} />
              </Link>
            </div>
            <ProductGrid products={topRated} loading={false} cols={4} />
          </div>
        </section>
      )}

      {/* ── App Download Banner ── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="app-banner rounded-2xl overflow-hidden">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px', textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📱</div>
              <h2 className="text-3xl font-black text-white mb-2">Shop Anytime, Anywhere!</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                Install ShopMart on your phone — works like a native app, completely free
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', padding: '12px 24px', color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📱 Add to Home Screen
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', padding: '12px 24px', color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🤖 Android PWA
                </div>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '10px 20px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                🎰 Spin & Win exclusive prizes — only in the app!
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;