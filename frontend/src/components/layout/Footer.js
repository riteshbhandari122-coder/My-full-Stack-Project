import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-8 pb-16 md:pb-0">

      {/* Newsletter */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)', padding: '40px 0' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiMail size={18} color="white" />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: 0 }}>
                Subscribe to our newsletter
              </h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
              Get exclusive deals, offers and product updates!
            </p>
          </div>

          {subscribed ? (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px 24px', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ You're subscribed! Thanks.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '420px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '12px',
                  border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)',
                  color: 'white', fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#0f1b2d', fontWeight: 700, padding: '12px 20px',
                borderRadius: '12px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
              }}>
                <FiSend size={16} /> Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 0' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { emoji: '🚚', title: 'Free Delivery', sub: 'Orders over NPR 2000' },
              { emoji: '🔒', title: 'Secure Payment', sub: '100% safe & encrypted' },
              { emoji: '↩️', title: 'Easy Returns', sub: '30-day return policy' },
              { emoji: '🎧', title: '24/7 Support', sub: 'Always here for you' },
            ].map(({ emoji, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{emoji}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Syne, sans-serif' }}>{title}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'Syne, sans-serif' }}>Shop</span>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'white', fontFamily: 'Syne, sans-serif' }}>Mart</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '20px' }}>
              Nepal's best online shopping destination. Shop electronics, fashion, home & more at unbeatable prices. Fast delivery across Nepal.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {[
                { Icon: FiFacebook, color: '#1877f2', label: 'Facebook' },
                { Icon: FiTwitter,  color: '#1da1f2', label: 'Twitter' },
                { Icon: FiInstagram,color: '#e1306c', label: 'Instagram' },
                { Icon: FiYoutube,  color: '#ff0000', label: 'YouTube' },
              ].map(({ Icon, color, label }) => (
                <a key={label} href="#" title={label} style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.06)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'none'; }}
                >
                  <Icon size={16} color="white" />
                </a>
              ))}
            </div>

            {/* Payment methods with proper styling */}
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Accepted Payments
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { name: 'Visa',       bg: '#1a1f71', color: 'white' },
                  { name: 'Mastercard', bg: '#eb001b', color: 'white' },
                  { name: 'eSewa',      bg: '#60bb46', color: 'white' },
                  { name: 'Khalti',     bg: '#5c2d91', color: 'white' },
                  { name: 'COD',        bg: '#374151', color: '#d1d5db' },
                ].map(({ name, bg, color }) => (
                  <span key={name} style={{
                    background: bg, color, fontSize: '0.7rem', fontWeight: 700,
                    padding: '4px 10px', borderRadius: '6px',
                    fontFamily: 'Syne, sans-serif', letterSpacing: '0.03em',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontFamily: 'Syne, sans-serif', fontSize: '0.95rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Blog', to: '/blog' },
                { label: 'Careers', to: '/careers' },
                { label: 'Press', to: '/press' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{ color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <span style={{ color: '#f59e0b', fontSize: '10px' }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontFamily: 'Syne, sans-serif', fontSize: '0.95rem' }}>
              Customer Service
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'FAQ', to: '/faq' },
                { label: 'Return Policy', to: '/returns' },
                { label: 'Shipping Info', to: '/shipping' },
                { label: 'Track Order', to: '/orders' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{ color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <span style={{ color: '#f59e0b', fontSize: '10px' }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '16px', fontFamily: 'Syne, sans-serif', fontSize: '0.95rem' }}>
              Contact Us
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { Icon: FiMapPin, text: 'Kathmandu, Nepal' },
                { Icon: FiPhone,  text: '+977-9800000000' },
                { Icon: FiMail,   text: 'support@shopmart.com' },
              ].map(({ Icon, text }) => (
                <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} color="#f59e0b" />
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5 }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 0' }}>
        <div className="max-w-7xl mx-auto px-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>© 2026 ShopMart, All rights reserved.</p>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>Made with ❤️ in Nepal 🇳🇵</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;