import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiGift, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── Prizes ──────────────────────────────────────────────────────────────────
const PRIZES = [
  { id: 1, label: '🎧 Headphones',    sub: 'Free premium headphones!',      color: '#f59e0b', bg: '#1a1000', type: 'prize',    code: 'HEADPHONES2026' },
  { id: 2, label: '90% OFF',          sub: 'Mega discount coupon',           color: '#ef4444', bg: '#1a0000', type: 'coupon',   code: 'SPIN90OFF' },
  { id: 3, label: '🔄 Try Again',     sub: 'Better luck next time!',         color: '#6b7280', bg: '#111827', type: 'tryagain', code: null },
  { id: 4, label: '📱 Phone Stand',   sub: 'Free phone stand accessory!',    color: '#3b82f6', bg: '#00081a', type: 'prize',    code: 'STAND2026' },
  { id: 5, label: '50% OFF',          sub: 'Half price on next order',       color: '#10b981', bg: '#001a0e', type: 'coupon',   code: 'SPIN50OFF' },
  { id: 6, label: '🎒 Free Bag',      sub: 'Free shopping bag!',             color: '#8b5cf6', bg: '#0d0020', type: 'prize',    code: 'FREEBAG2026' },
  { id: 7, label: '🔄 Try Again',     sub: 'Almost! Spin again.',            color: '#6b7280', bg: '#111827', type: 'tryagain', code: null },
  { id: 8, label: '25% OFF',          sub: 'Save 25% on any product',        color: '#f97316', bg: '#1a0800', type: 'coupon',   code: 'SPIN25OFF' },
  { id: 9, label: '⌚ Smart Watch',   sub: 'Win a free smartwatch!',         color: '#ec4899', bg: '#1a0010', type: 'prize',    code: 'WATCH2026' },
  { id: 10, label: '🎁 Mystery Box',  sub: 'A surprise gift awaits!',        color: '#fbbf24', bg: '#1a1000', type: 'prize',    code: 'MYSTERY2026' },
];

const TOTAL = PRIZES.length;
const SLICE = 360 / TOTAL;

// ─── Draw wheel on canvas ─────────────────────────────────────────────────────
function drawWheel(canvas, rotation) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  ctx.clearRect(0, 0, size, size);

  // Outer glow ring
  const glow = ctx.createRadialGradient(cx, cy, r - 8, cx, cy, r + 4);
  glow.addColorStop(0, 'rgba(245,158,11,0.5)');
  glow.addColorStop(1, 'rgba(245,158,11,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
  ctx.fillStyle = glow;
  ctx.fill();

  PRIZES.forEach((prize, i) => {
    const startAngle = ((rotation + i * SLICE - 90) * Math.PI) / 180;
    const endAngle   = ((rotation + (i + 1) * SLICE - 90) * Math.PI) / 180;

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? prize.bg : shadeHex(prize.bg, 15);
    ctx.fill();

    // Slice border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Colored outer arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = prize.color;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + (endAngle - startAngle) / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = prize.color;
    ctx.font = `bold ${size < 400 ? 11 : 13}px Syne, sans-serif`;
    ctx.shadowColor = prize.color;
    ctx.shadowBlur = 6;
    ctx.fillText(prize.label, r - 12, 5);
    ctx.restore();
  });

  // Center circle
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 44);
  grad.addColorStop(0, '#1a2740');
  grad.addColorStop(1, '#0f1b2d');
  ctx.beginPath();
  ctx.arc(cx, cy, 44, 0, 2 * Math.PI);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center logo text
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold ${size < 400 ? 10 : 12}px Syne, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPIN', cx, cy - 7);
  ctx.fillText('&WIN', cx, cy + 9);
}

function shadeHex(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SpinWheelPage = () => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const rafRef = useRef(null);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult]     = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [copied, setCopied]     = useState(false);
  const [particles, setParticles] = useState([]);

  // Draw on mount and rotation change
  useEffect(() => {
    drawWheel(canvasRef.current, rotationRef.current);
  }, []);

  // Confetti particles
  const spawnParticles = (color) => {
    const p = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 40,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 6 + 2),
      color,
      size: Math.random() * 8 + 4,
      rot: Math.random() * 360,
    }));
    setParticles(p);
    setTimeout(() => setParticles([]), 2200);
  };

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;
    setResult(null);
    setSpinning(true);
    setSpinsLeft(s => s - 1);

    // Pick random prize weighted slightly away from try-again
    const winners = PRIZES.map((p, i) => i).filter(i => PRIZES[i].type !== 'tryagain');
    const losers  = PRIZES.map((p, i) => i).filter(i => PRIZES[i].type === 'tryagain');
    const roll    = Math.random();
    const targetIdx = roll < 0.65
      ? winners[Math.floor(Math.random() * winners.length)]
      : losers[Math.floor(Math.random() * losers.length)];

    // How many degrees to rotate so targetIdx lands under the pointer (top = 270°)
    const targetDeg  = 360 - (targetIdx * SLICE + SLICE / 2);
    const extraSpins = 5 + Math.floor(Math.random() * 4); // 5-8 full spins
    const finalAngle = rotationRef.current + extraSpins * 360 + targetDeg - (rotationRef.current % 360);

    const start    = performance.now();
    const duration = 4500;
    const startRot = rotationRef.current;

    const easeOut = t => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const elapsed = now - start;
      const t       = Math.min(elapsed / duration, 1);
      const current = startRot + (finalAngle - startRot) * easeOut(t);
      rotationRef.current = current % 360;
      drawWheel(canvasRef.current, rotationRef.current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = finalAngle % 360;
        drawWheel(canvasRef.current, rotationRef.current);
        setSpinning(false);
        const prize = PRIZES[targetIdx];
        setResult(prize);
        if (prize.type !== 'tryagain') spawnParticles(prize.color);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  const copyCode = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code).then(() => {
      setCopied(true);
      toast.success('Coupon code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1b2d 0%, #0a1422 40%, #0f2744 70%, #162032 100%)',
      fontFamily: 'DM Sans, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow blobs */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', pointerEvents: 'none' }} />

      {/* Confetti */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, background: p.color,
          borderRadius: '2px', transform: `rotate(${p.rot}deg)`,
          animation: 'confettiFall 2s ease-out forwards',
          zIndex: 100, pointerEvents: 'none',
          '--vx': `${p.vx * 20}px`, '--vy': `${p.vy * 20}px`,
        }} />
      ))}

      <style>{`
        @keyframes confettiFall {
          0%   { opacity:1; transform: translate(0,0) rotate(0deg); }
          100% { opacity:0; transform: translate(var(--vx), 200px) rotate(720deg); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 20px rgba(245,158,11,0.3); }
          50%      { box-shadow: 0 0 40px rgba(245,158,11,0.6); }
        }
        @keyframes prize-in {
          0%   { opacity:0; transform: scale(0.7) translateY(20px); }
          100% { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes pointer-bounce {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-4px); }
        }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <Link to="/" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'all 0.2s' }}>
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Spin & <span style={{ color: '#f59e0b' }}>Win!</span>
            </h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
              Try your luck — you have <strong style={{ color: '#f59e0b' }}>{spinsLeft} spin{spinsLeft !== 1 ? 's' : ''}</strong> left today
            </p>
          </div>

          {/* Spins counter */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: i < spinsLeft ? '#f59e0b' : 'rgba(255,255,255,0.1)', boxShadow: i < spinsLeft ? '0 0 8px rgba(245,158,11,0.6)' : 'none', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>

          {/* Wheel container */}
          <div style={{ position: 'relative', display: 'inline-block' }}>

            {/* Pointer arrow at top */}
            <div style={{
              position: 'absolute', top: '-18px', left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '28px solid #f59e0b',
              zIndex: 10,
              filter: 'drop-shadow(0 4px 8px rgba(245,158,11,0.6))',
              animation: spinning ? 'none' : 'pointer-bounce 1.5s ease-in-out infinite',
            }} />

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              style={{
                borderRadius: '50%',
                display: 'block',
                cursor: spinning || spinsLeft === 0 ? 'not-allowed' : 'pointer',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
              onClick={spin}
            />
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={spinning || spinsLeft === 0}
            style={{
              padding: '14px 48px',
              borderRadius: '16px',
              border: 'none',
              background: spinning || spinsLeft === 0
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: spinning || spinsLeft === 0 ? 'rgba(255,255,255,0.3)' : '#0f1b2d',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: spinning || spinsLeft === 0 ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: spinning || spinsLeft === 0 ? 'none' : '0 4px 24px rgba(245,158,11,0.5)',
              transition: 'all 0.2s',
              transform: spinning ? 'scale(0.97)' : 'scale(1)',
            }}
          >
            {spinning ? '🌀 Spinning...' : spinsLeft === 0 ? '😢 No spins left' : '🎰 SPIN THE WHEEL!'}
          </button>

          {spinsLeft === 0 && !spinning && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
              Come back tomorrow for more spins! 🌟
            </p>
          )}

          {/* Result card */}
          {result && (
            <div style={{
              width: '100%', maxWidth: '420px',
              background: result.type === 'tryagain'
                ? 'rgba(255,255,255,0.04)'
                : `linear-gradient(135deg, ${result.bg}, rgba(0,0,0,0.6))`,
              border: `1px solid ${result.color}44`,
              borderRadius: '20px',
              padding: '28px 24px',
              textAlign: 'center',
              animation: 'prize-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
              boxShadow: result.type !== 'tryagain' ? `0 8px 40px ${result.color}33` : 'none',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                {result.type === 'tryagain' ? '😅' : result.type === 'coupon' ? '🎟️' : '🎁'}
              </div>
              <div style={{ color: result.color, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                {result.label}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginBottom: result.code ? '20px' : '0' }}>
                {result.sub}
              </div>

              {result.code && (
                <div>
                  <div style={{ background: 'rgba(0,0,0,0.35)', border: `1px dashed ${result.color}66`, borderRadius: '12px', padding: '12px 16px', marginBottom: '12px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: 'Syne, sans-serif' }}>
                      Your Code
                    </div>
                    <div style={{ color: result.color, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.08em' }}>
                      {result.code}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={copyCode} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1px solid ${result.color}44`, background: `${result.color}18`, color: result.color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
                      {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                    <Link to="/products" style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${result.color}, ${result.color}cc)`, color: '#0f1b2d', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                      <FiGift size={15} />
                      Shop Now
                    </Link>
                  </div>
                </div>
              )}

              {result.type === 'tryagain' && spinsLeft > 0 && (
                <button onClick={spin} style={{ marginTop: '12px', padding: '10px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Spin Again ({spinsLeft} left)
                </button>
              )}
            </div>
          )}

          {/* Prizes legend */}
          <div style={{ width: '100%' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '16px' }}>
              What you can win
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {PRIZES.filter(p => p.type !== 'tryagain').map(prize => (
                <div key={prize.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${prize.color}22`, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: prize.color, flexShrink: 0, boxShadow: `0 0 6px ${prize.color}` }} />
                  <div>
                    <div style={{ color: prize.color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.8rem' }}>{prize.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>{prize.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelPage;