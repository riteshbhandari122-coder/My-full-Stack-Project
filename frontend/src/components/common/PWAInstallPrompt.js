import React, { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PWAInstallPrompt.js — EcoMart Rebranded Version
// ─────────────────────────────────────────────────────────────────────────────

const DISMISS_KEY = 'ecomart-pwa-dismissed';
const DISMISS_DAYS = 7;

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed as standalone app — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    // Detect iOS (Safari on iPhone/iPad)
    const ios =
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
      !window.navigator.standalone;
    setIsIOS(ios);

    // For iOS: show the manual instructions after 3 seconds
    if (ios) {
      const t = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(t);
    }

    // For Android/Desktop Chrome: wait for the browser's install event
    const handleBeforeInstall = (e) => {
      e.preventDefault(); // stop browser's default mini-infobar
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem(DISMISS_KEY);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  // Nothing to show
  if (isInstalled || !showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '16px',
        right: '16px',
        zIndex: 9999,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '16px',
          border: '1px solid rgba(0,0,0,0.06)',
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #66BB6A, #2E7D32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
            }}
          >
            🌱
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#111' }}>
              Install EcoMart
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {isIOS
                ? 'Add to your home screen for quick sustainable shopping'
                : 'Get the app — faster & works offline!'}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#aaa',
              padding: '4px',
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Android/Desktop — show Install button */}
        {!isIOS && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDismiss}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#555',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              style={{
                flex: 2,
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #66BB6A, #2E7D32)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              📲 Install App
            </button>
          </div>
        )}

        {/* iOS — show manual instructions */}
        {isIOS && (
          <div
            style={{
              background: '#E8F5E9',
              borderRadius: '12px',
              padding: '12px 14px',
              marginTop: '4px',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', color: '#1B5E20', textAlign: 'center', lineHeight: 1.6 }}>
              Tap the <strong>Share</strong> button{' '}
              <span style={{ fontSize: '16px' }}>⎙</span>{' '}
              at the bottom of Safari, then tap{' '}
              <strong>"Add to Home Screen"</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;