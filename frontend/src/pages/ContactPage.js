import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── ShopMart store location — Kathmandu ─────────────────────────────────────
const STORE_LAT = 27.7172;
const STORE_LNG = 85.3240;

const StoreMap = () => {
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!window.L || !document.getElementById('store-map')) return;
      if (window._storeMap) { window._storeMap.remove(); window._storeMap = null; }

      const map = window.L.map('store-map', { scrollWheelZoom: false }).setView([STORE_LAT, STORE_LNG], 15);
      window._storeMap = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);

      const storeIcon = window.L.divIcon({
        html: `<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);border:4px solid white;box-shadow:0 6px 20px rgba(245,158,11,0.5);display:flex;align-items:center;justify-content:center;font-size:22px;">🛍️</div>`,
        className: '', iconSize: [48, 48], iconAnchor: [24, 24],
      });

      window.L.marker([STORE_LAT, STORE_LNG], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;padding:4px;">
            <b style="font-size:14px;">🛍️ ShopMart</b><br/>
            <span style="color:#6b7280;font-size:12px;">Kathmandu, Nepal</span><br/>
            <span style="color:#f59e0b;font-size:12px;font-weight:600;">Open 24/7 Online</span>
          </div>
        `, { maxWidth: 220 })
        .openPopup();

      // Decorative radius circle
      window.L.circle([STORE_LAT, STORE_LNG], {
        radius: 300, color: '#f59e0b', fillColor: '#f59e0b',
        fillOpacity: 0.08, weight: 2, dashArray: '6 4',
      }).addTo(map);
    };

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }

    return () => {
      if (window._storeMap) { window._storeMap.remove(); window._storeMap = null; }
    };
  }, []);

  return (
    <div id="store-map" style={{ height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', zIndex: 1 }} />
  );
};

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Message sent! We will reply within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const info = [
    { icon: FiMapPin, label: 'Address',       value: 'Kathmandu, Bagmati Province, Nepal',  color: '#f59e0b' },
    { icon: FiPhone,  label: 'Phone',          value: '+977-9800000000',                      color: '#3b82f6' },
    { icon: FiMail,   label: 'Email',          value: 'support@shopmart.com',                 color: '#10b981' },
    { icon: FiClock,  label: 'Support Hours',  value: 'Sunday – Friday, 9AM – 6PM',          color: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px 80px', fontFamily: '"DM Sans", sans-serif' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '99px', padding: '6px 16px', marginBottom: '16px' }}>
          <FiMapPin size={14} color="#f59e0b" />
          <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>Find Us</span>
        </div>
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
          Get in <span style={{ color: '#f59e0b' }}>Touch</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Have a question or need help? We're here for you. Reach out and we'll respond within 24 hours.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '40px' }}>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {info.map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}

          {/* Social links */}
          <div style={{ padding: '16px', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Follow Us</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { label: 'FB', color: '#1877f2' },
                { label: 'IG', color: '#e1306c' },
                { label: 'TW', color: '#1da1f2' },
                { label: 'YT', color: '#ff0000' },
              ].map(({ label, color }) => (
                <div key={label} style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#0f172a', margin: '0 0 20px' }}>Send us a message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Your Name *', key: 'name', type: 'text', placeholder: 'Ritesh Bhandari' },
              { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Subject', key: 'subject', type: 'text', placeholder: 'How can we help?' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans", sans-serif', color: '#0f172a', transition: 'border-color 0.18s' }}
                  onFocus={e => e.target.style.borderColor = '#f59e0b'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Message *</label>
              <textarea
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Write your message here..."
                rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans", sans-serif', color: '#0f172a', resize: 'vertical', transition: 'border-color 0.18s' }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <button type="submit" disabled={sending} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: sending ? '#e2e8f0' : 'linear-gradient(135deg,#f59e0b,#d97706)', color: sending ? '#94a3b8' : '#0f1b2d', fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: sending ? 'none' : '0 4px 16px rgba(245,158,11,0.35)', transition: 'all 0.2s' }}>
              {sending ? 'Sending...' : <><FiSend size={15} /> Send Message</>}
            </button>
          </form>
        </div>
      </div>

      {/* Map */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiMapPin size={16} color="#f59e0b" /> Our Location
        </h2>
        <StoreMap />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', background: '#fefce8', borderRadius: '10px', border: '1px solid #fde68a' }}>
          <FiMapPin size={14} color="#d97706" />
          <span style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>ShopMart HQ — Kathmandu, Bagmati Province, Nepal</span>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;