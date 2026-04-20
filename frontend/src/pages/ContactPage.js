import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiLayers } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ShopMart store — Kathmandu New Road area
const STORE_LAT = 27.70333;
const STORE_LNG = 85.31239;

const StoreMap = () => {
  const [mapType, setMapType] = useState('satellite');

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

      const map = window.L.map('store-map', {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([STORE_LAT, STORE_LNG], 18);
      window._storeMap = map;
      window._currentLayer = null;

      // Tile layers
      const layers = {
        satellite: window.L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { attribution: 'Tiles © Esri — Source: Esri, USGS, NOAA', maxZoom: 19 }
        ),
        street: window.L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { attribution: '© OpenStreetMap contributors', maxZoom: 19 }
        ),
      };

      layers.satellite.addTo(map);
      window._currentLayer = layers.satellite;
      window._mapLayers = layers;

      // Store marker
      const storeIcon = window.L.divIcon({
        html: `
          <div style="position:relative;">
            <div style="position:absolute;top:-60px;left:50%;transform:translateX(-50%);background:white;border-radius:10px;padding:6px 10px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.2);border:2px solid #f59e0b;">
              <span style="font-size:12px;font-weight:700;color:#0f1b2d;font-family:sans-serif;">🛍️ ShopMart</span>
            </div>
            <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #f59e0b;margin:0 auto;position:absolute;top:-14px;left:50%;transform:translateX(-50%);"></div>
            <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);border:4px solid white;box-shadow:0 6px 20px rgba(245,158,11,0.6);display:flex;align-items:center;justify-content:center;font-size:22px;">🛍️</div>
            <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:12px;height:12px;background:#f59e0b;border-radius:50%;box-shadow:0 0 0 4px rgba(245,158,11,0.3);"></div>
          </div>`,
        className: '',
        iconSize: [48, 80],
        iconAnchor: [24, 54],
      });

      window.L.marker([STORE_LAT, STORE_LNG], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;padding:6px;min-width:180px;">
            <div style="font-size:15px;font-weight:800;color:#0f1b2d;margin-bottom:4px;">🛍️ ShopMart</div>
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">New Road, Kathmandu 44600, Nepal</div>
            <div style="font-size:11px;background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:6px;font-weight:600;">📦 Free delivery across Kathmandu</div>
          </div>
        `, { maxWidth: 220 });

      // Accuracy circle
      window.L.circle([STORE_LAT, STORE_LNG], {
        radius: 80,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map);
    };

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setTimeout(initMap, 100);
      document.head.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }

    return () => {
      if (window._storeMap) { window._storeMap.remove(); window._storeMap = null; }
    };
  }, []);

  const switchLayer = (type) => {
    setMapType(type);
    if (window._storeMap && window._mapLayers) {
      if (window._currentLayer) window._storeMap.removeLayer(window._currentLayer);
      window._mapLayers[type].addTo(window._storeMap);
      window._currentLayer = window._mapLayers[type];
    }
  };

  return (
    <div>
      {/* Map type toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[
          { key: 'satellite', label: '🛰️ Satellite' },
          { key: 'street',    label: '🗺️ Street' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => switchLayer(key)} style={{
            padding: '7px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.82rem',
            background: mapType === key ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#f1f5f9',
            color: mapType === key ? '#0f1b2d' : '#64748b',
            boxShadow: mapType === key ? '0 2px 10px rgba(245,158,11,0.35)' : 'none',
            transition: 'all 0.2s',
          }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
          <FiLayers size={13} /> Real-time satellite imagery
        </div>
      </div>

      <div id="store-map" style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />

      {/* Address bar below map */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', padding: '12px 16px', background: 'linear-gradient(135deg,#fefce8,#fef9c3)', borderRadius: '12px', border: '1px solid #fde68a' }}>
        <FiMapPin size={16} color="#d97706" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}>ShopMart Store</div>
          <div style={{ fontSize: '0.78rem', color: '#b45309' }}>New Road, Kathmandu 44600, Bagmati Province, Nepal</div>
        </div>
        <a
          href="https://www.google.com/maps?q=27.70333,85.31239&z=17&t=k"
          target="_blank"
          rel="noreferrer"
          style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: '10px', background: '#0f1b2d', color: 'white', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: '"Syne", sans-serif' }}
        >
          Open in Maps →
        </a>
      </div>
    </div>
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
    try {
      await api.post('/auth/contact', form);
      toast.success('Message sent! We will reply within 24 hours. ✅');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.');
    }
    setSending(false);
  };

  const info = [
    { icon: FiMapPin, label: 'Address',      value: 'New Road, Kathmandu, Nepal',  color: '#f59e0b' },
    { icon: FiPhone,  label: 'Phone',         value: '+977-9800000000',              color: '#3b82f6' },
    { icon: FiMail,   label: 'Email',         value: 'shopmartsupport@gmail.com',         color: '#10b981', href: 'mailto:shopmartsupport@gmail.com?subject=ShopMart Support Query' },
    { icon: FiClock,  label: 'Support Hours', value: 'Sun–Fri, 9AM – 6PM',          color: '#8b5cf6' },
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
          Have a question? We are here for you — reach out and we will respond within 24 hours.
        </p>
      </div>

      {/* Info + Form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '36px' }}>

        {/* Info cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {info.map((item) => { const { icon: Icon, label, value, color } = item; return (
            <div key={label} onClick={() => {
                  if (item.href) {
                    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                    if (isMobile) {
                      window.location.href = 'mailto:shopmartsupport@gmail.com?subject=ShopMart Support Query';
                    } else {
                      window.open('https://mail.google.com/mail/?view=cm&to=shopmartsupport@gmail.com&su=ShopMart+Support+Query', '_blank');
                    }
                  }
                }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', cursor: item.href ? 'pointer' : 'default' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#0f172a', margin: '0 0 20px' }}>Send us a message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Your Name *',      key: 'name',    type: 'text',  placeholder: 'Ritesh Bhandari' },
              { label: 'Email Address *',  key: 'email',   type: 'email', placeholder: 'you@example.com' },
              { label: 'Subject',          key: 'subject', type: 'text',  placeholder: 'How can we help?' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans", sans-serif', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#f59e0b'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Message *</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your message here..." rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans", sans-serif', color: '#0f172a', resize: 'vertical' }}
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

      {/* Satellite Map */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiMapPin size={16} color="#f59e0b" /> Our Location — Satellite View
        </h2>
        <StoreMap />
      </div>
    </div>
  );
};

export default ContactPage;