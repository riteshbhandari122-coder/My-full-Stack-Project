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

  const handleEmailClick = (e) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      window.open(
        'https://mail.google.com/mail/?view=cm&to=ecomartsupport@gmail.com&su=EcoMart Support Query',
        '_blank'
      );
    }
  };

  return (
    <footer className="text-gray-300 mt-8 pb-16 md:pb-0" style={{ backgroundColor: '#0d2818' }}>

      {/* Newsletter */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)', padding: '24px 0' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiMail size={16} color="white" />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: 0 }}>
                Subscribe to our newsletter
              </h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>
              Get exclusive deals, offers and product updates!
            </p>
          </div>
          {subscribed ? (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 20px', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              ✅ You're subscribed! Thanks.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '400px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px',
                  border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)',
                  color: 'white', fontSize: '0.85rem', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #66BB6A, #2E7D32)',
                color: '#ffffff', fontWeight: 700, padding: '10px 18px',
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(46,125,50,0.4)', fontSize: '0.85rem',
              }}>
                <FiSend size={15} /> Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ background: '#0d2818', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 0' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { emoji: '🚚', title: 'Free Delivery', sub: 'Orders over NPR 2000' },
              { emoji: '🔒', title: 'Secure Payment', sub: '100% safe & encrypted' },
              { emoji: '↩️', title: 'Easy Returns', sub: '30-day return policy' },
              { emoji: '🎧', title: '24/7 Support', sub: 'Always here for you' },
            ].map(({ emoji, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{emoji}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Syne, sans-serif' }}>{title}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#66BB6A', fontFamily: 'Syne, sans-serif' }}>Eco</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', fontFamily: 'Syne, sans-serif' }}>Mart</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '16px' }}>
              Nepal's best online shopping destination. Shop electronics, fashion, home & more at unbeatable prices. Fast delivery across Nepal.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {[
                { Icon: FiFacebook,  color: '#1877f2', label: 'Facebook' },
                { Icon: FiTwitter,   color: '#1da1f2', label: 'Twitter' },
                { Icon: FiInstagram, color: '#e1306c', label: 'Instagram' },
                { Icon: FiYoutube,   color: '#ff0000', label: 'YouTube' },
              ].map(({ Icon, color, label }) => (
                <a key={label} href="#" title={label} style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: '#143d24', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.06)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#143d24'; e.currentTarget.style.transform = 'none'; }}
                >
                  <Icon size={15} color="white" />
                </a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                    background: bg, color, fontSize: '0.68rem', fontWeight: 700,
                    padding: '3px 8px', borderRadius: '5px',
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
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '12px', fontFamily: 'Syne, sans-serif', fontSize: '0.9rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'About Us',   to: '/about' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Blog',       to: '/blog' },
                { label: 'Careers',    to: '/careers' },
                { label: 'Press',      to: '/press' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{ color: '#9ca3af', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#66BB6A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <span style={{ color: '#66BB6A', fontSize: '10px' }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '12px', fontFamily: 'Syne, sans-serif', fontSize: '0.9rem' }}>
              Customer Service
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'FAQ',            to: '/faq' },
                { label: 'Return Policy',  to: '/returns' },
                { label: 'Shipping Info',  to: '/shipping' },
                { label: 'Track Order',    to: '/orders' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{ color: '#9ca3af', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#66BB6A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <span style={{ color: '#66BB6A', fontSize: '10px' }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '12px', fontFamily: 'Syne, sans-serif', fontSize: '0.9rem' }}>
              Contact Us
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { Icon: FiMapPin, text: 'Kathmandu, Nepal', to: '/contact' },
                { Icon: FiPhone,  text: '+977-9843787681', href: 'tel:+9779843787681' },
                { Icon: FiMail,   text: 'ecomartsupport@gmail.com', href: 'mailto:ecomartsupport@gmail.com', onClick: handleEmailClick },
              ].map(({ Icon, text, onClick, to, href }) => {
                const textStyle = { color: '#9ca3af', fontSize: '0.82rem', lineHeight: 1.4, cursor: 'pointer', textDecoration: 'none' };
                
                return (
                  <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(46,125,50,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={12} color="#66BB6A" />
                    </div>
                    {to ? (
                      <Link to={to} style={textStyle}
                        onMouseEnter={e => e.currentTarget.style.color = '#66BB6A'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                      >
                        {text}
                      </Link>
                    ) : href ? (
                      <a href={href} onClick={onClick} style={textStyle}
                        onMouseEnter={e => e.currentTarget.style.color = '#66BB6A'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                      >
                        {text}
                      </a>
                    ) : (
                      <span onClick={onClick} style={textStyle}
                        onMouseEnter={e => e.currentTarget.style.color = '#66BB6A'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                      >
                        {text}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 0' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%', gap: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: 0, justifySelf: 'start' }}>© 2026 EcoMart, All rights reserved.</p>
            <Link to="/contact" style={{
              color: '#66BB6A', fontSize: '1rem', fontWeight: 700, textDecoration: 'none',
              justifySelf: 'center', padding: '6px 18px', borderRadius: '10px',
              background: 'rgba(46,125,50,0.15)', border: '1px solid rgba(102,187,106,0.3)',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#4ade80'; e.currentTarget.style.background = 'rgba(46,125,50,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#66BB6A'; e.currentTarget.style.background = 'rgba(46,125,50,0.15)'; }}
            >
              Contact Us
            </Link>
            <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: 0, justifySelf: 'end' }}>Made with ❤️ in Nepal 🇳🇵</p>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;