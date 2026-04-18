import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiCheck, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── Prizes — based on ShopMart's actual products ────────────────────────────
const PRIZES = [
  { id: 1,  label: 'Headphones',   sub: 'Win free headphones',       emoji: '🎧', color: '#f59e0b', type: 'prize',    code: 'WIN-HEADPHONES' },
  { id: 2,  label: '30% OFF',      sub: 'On your next order',         emoji: '🏷️', color: '#3b82f6', type: 'coupon',   code: 'SPIN30' },
  { id: 3,  label: 'Try Again',    sub: 'Better luck next spin',      emoji: '🔄', color: '#6b7280', type: 'tryagain', code: null },
  { id: 4,  label: 'Laptop Bag',   sub: 'Free laptop carry bag',      emoji: '💼', color: '#8b5cf6', type: 'prize',    code: 'WIN-LAPTOPBAG' },
  { id: 5,  label: '50% OFF',      sub: 'Half price coupon',          emoji: '🎟️', color: '#ef4444', type: 'coupon',   code: 'SPIN50' },
  { id: 6,  label: 'Phone Case',   sub: 'Free mobile phone case',     emoji: '📱', color: '#10b981', type: 'prize',    code: 'WIN-PHONECASE' },
  { id: 7,  label: 'Try Again',    sub: 'Almost there!',              emoji: '🔄', color: '#6b7280', type: 'tryagain', code: null },
  { id: 8,  label: '15% OFF',      sub: 'Discount on any item',       emoji: '💸', color: '#f97316', type: 'coupon',   code: 'SPIN15' },
  { id: 9,  label: 'Smart Watch',  sub: 'Win a free smartwatch',      emoji: '⌚', color: '#ec4899', type: 'prize',    code: 'WIN-WATCH' },
  { id: 10, label: 'Free Shipping', sub: 'On any order today',        emoji: '🚚', color: '#06b6d4', type: 'coupon',   code: 'FREESHIP' },
];

const TOTAL = PRIZES.length;
const SLICE = (2 * Math.PI) / TOTAL;

// ─── Alternating slice colors — clean, not dark ───────────────────────────────
const SLICE_COLORS = ['#1e2d45', '#162032'];

function drawWheel(canvas, rotation) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  ctx.clearRect(0, 0, size, size);

  // Outer border ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, 2 * Math.PI);
  ctx.fillStyle = '#0f1b2d';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  PRIZES.forEach((prize, i) => {
    const startAngle = rotation + i * SLICE - Math.PI / 2;
    const endAngle   = rotation + (i + 1) * SLICE - Math.PI / 2;
    const midAngle   = (startAngle + endAngle) / 2;

    // Slice background
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = SLICE_COLORS[i % 2];
    ctx.fill();

    // Colored edge arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = prize.color;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Divider lines
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Emoji
    const emojiRadius = r * 0.72;
    const ex = cx + emojiRadius * Math.cos(midAngle);
    const ey = cy + emojiRadius * Math.sin(midAngle);
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.font = `${size < 380 ? 13 : 16}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prize.emoji, 0, -14);
    ctx.restore();

    // Label text
    const textRadius = r * 0.52;
    const tx = cx + textRadius * Math.cos(midAngle);
    const ty = cy + textRadius * Math.sin(midAngle);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = prize.type === 'tryagain' ? '#6b7280' : '#ffffff';
    ctx.font = `600 ${size < 380 ? 9 : 11}px "DM Sans", sans-serif`;
    ctx.fillText(prize.label, 0, 0);
    ctx.restore();
  });

  // Center hub
  const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
  hubGrad.addColorStop(0, '#1e2d45');
  hubGrad.addColorStop(1, '#0f1b2d');
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, 2 * Math.PI);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Center icon text
  ctx.fillStyle = '#f59e0b';
  ctx.font = `800 ${size < 380 ? 9 : 11}px "Syne", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPIN', cx, cy - 6);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `500 ${size < 380 ? 7 : 9}px "DM Sans", sans-serif`;
  ctx.fillText('& WIN', cx, cy + 8);
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SpinWheelPage = () => {
  const canvasRef  = useRef(null);
  const rotRef     = useRef(0);
  const rafRef     = useRef(null);

  const [spinning,   setSpinning]   = useState(false);
  const [result,     setResult]     = useState(null);
  const [spinsLeft,  setSpinsLeft]  = useState(3);
  const [copied,     setCopied]     = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Responsive size
    const size = Math.min(window.innerWidth - 48, 380);
    canvas.width  = size;
    canvas.height = size;
    drawWheel(canvas, rotRef.current);
  }, []);

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;
    setResult(null);
    setShowResult(false);
    setSpinning(true);
    setSpinsLeft(s => s - 1);

    // Pick prize — 60% chance of winning something real
    const winnable = PRIZES.map((p, i) => i).filter(i => PRIZES[i].type !== 'tryagain');
    const losers   = PRIZES.map((p, i) => i).filter(i => PRIZES[i].type === 'tryagain');
    const roll     = Math.random();
    const idx      = roll < 0.65
      ? winnable[Math.floor(Math.random() * winnable.length)]
      : losers[Math.floor(Math.random() * losers.length)];

    // Target angle: each slice center should land at top (pointing at arrow)
    const sliceDeg    = 360 / TOTAL;
    const targetDeg   = -(idx * sliceDeg + sliceDeg / 2);
    const currentDeg  = (rotRef.current * 180) / Math.PI;
    const extraSpins  = (5 + Math.floor(Math.random() * 4)) * 360;
    const finalDeg    = currentDeg + extraSpins + (targetDeg - (currentDeg % 360));
    const finalRad    = (finalDeg * Math.PI) / 180;

    const start    = performance.now();
    const duration = 4800;
    const startRot = rotRef.current;
    const easeOut  = t => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const t   = Math.min((now - start) / duration, 1);
      rotRef.current = startRot + (finalRad - startRot) * easeOut(t);
      drawWheel(canvasRef.current, rotRef.current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rotRef.current = finalRad;
        drawWheel(canvasRef.current, rotRef.current);
        setSpinning(false);
        setResult(PRIZES[idx]);
        setShowResult(true);
        if (PRIZES[idx].type !== 'tryagain') {
          toast.success(`You won: ${PRIZES[idx].label}!`, { duration: 3000 });
        }
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  const copyCode = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code).then(() => {
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a1220',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-5px); }
        }
        .spin-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(245,158,11,0.45) !important;
        }
        .spin-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .prize-row:hover {
          background: rgba(255,255,255,0.04) !important;
        }
      `}</style>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', animation: 'fadeUp 0.4s ease' }}>
          <Link to="/" style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          }}>
            <FiArrowLeft size={17} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: 0, fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#ffffff',
              letterSpacing: '-0.03em', lineHeight: 1.1,
            }}>
              Spin & <span style={{ color: '#f59e0b' }}>Win</span>
            </h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.825rem' }}>
              {spinsLeft > 0 ? `${spinsLeft} spin${spinsLeft > 1 ? 's' : ''} remaining today` : 'No spins left — come back tomorrow'}
            </p>
          </div>
          {/* Spin dots */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: i < spinsLeft ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Wheel area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', animation: 'fadeUp 0.5s ease 0.1s both' }}>

          {/* Wheel + pointer */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Pointer */}
            <div style={{
              position: 'absolute', top: '-16px', left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '11px solid transparent',
              borderRight: '11px solid transparent',
              borderTop: '22px solid #f59e0b',
              zIndex: 10,
              filter: 'drop-shadow(0 2px 6px rgba(245,158,11,0.5))',
              animation: spinning ? 'none' : 'arrowBounce 1.8s ease-in-out infinite',
            }} />

            {/* Subtle outer glow — not too much */}
            <div style={{
              position: 'absolute', inset: '-12px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              onClick={spin}
              style={{
                borderRadius: '50%',
                display: 'block',
                cursor: spinning || spinsLeft === 0 ? 'not-allowed' : 'pointer',
                opacity: spinsLeft === 0 && !spinning ? 0.5 : 1,
                transition: 'opacity 0.3s',
              }}
            />
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={spinning || spinsLeft === 0}
            className="spin-btn"
            style={{
              padding: '13px 44px',
              borderRadius: '14px',
              border: 'none',
              background: spinning || spinsLeft === 0
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: spinning || spinsLeft === 0 ? 'rgba(255,255,255,0.25)' : '#0f1b2d',
              fontFamily: '"Syne", sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: spinning || spinsLeft === 0 ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: spinning || spinsLeft === 0 ? 'none' : '0 4px 20px rgba(245,158,11,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {spinning ? 'Spinning...' : spinsLeft === 0 ? 'No spins left today' : '🎰 Spin the Wheel'}
          </button>

          {/* Result card */}
          {showResult && result && (
            <div style={{
              width: '100%',
              background: result.type === 'tryagain'
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${result.type === 'tryagain' ? 'rgba(255,255,255,0.07)' : result.color + '33'}`,
              borderRadius: '18px',
              padding: '24px',
              animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: result.code ? '20px' : '0' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: result.type === 'tryagain' ? 'rgba(255,255,255,0.05)' : `${result.color}18`,
                  border: `1px solid ${result.type === 'tryagain' ? 'rgba(255,255,255,0.08)' : result.color + '30'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  {result.emoji}
                </div>
                <div>
                  <div style={{
                    color: result.type === 'tryagain' ? 'rgba(255,255,255,0.5)' : '#ffffff',
                    fontFamily: '"Syne", sans-serif', fontWeight: 700,
                    fontSize: '1.15rem', letterSpacing: '-0.02em',
                  }}>
                    {result.type === 'tryagain' ? 'Try Again!' : `You won ${result.label}!`}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.825rem', marginTop: '2px' }}>
                    {result.sub}
                  </div>
                </div>
              </div>

              {result.code && (
                <>
                  {/* Code box */}
                  <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px dashed ${result.color}44`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                        Coupon Code
                      </div>
                      <div style={{ color: result.color, fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.06em' }}>
                        {result.code}
                      </div>
                    </div>
                    <button onClick={copyCode} style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: `${result.color}18`, border: `1px solid ${result.color}30`,
                      color: result.color, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    }}>
                      {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={copyCode} style={{
                      flex: 1, padding: '11px', borderRadius: '12px',
                      border: `1px solid rgba(255,255,255,0.1)`,
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.7)', fontWeight: 600,
                      fontSize: '0.875rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontFamily: '"DM Sans", sans-serif',
                    }}>
                      {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                    <Link to="/products" style={{
                      flex: 1, padding: '11px', borderRadius: '12px', border: 'none',
                      background: `linear-gradient(135deg, ${result.color}, ${result.color}bb)`,
                      color: '#0f1b2d', fontWeight: 700, fontSize: '0.875rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '6px', textDecoration: 'none',
                      fontFamily: '"Syne", sans-serif',
                    }}>
                      <FiShoppingBag size={14} /> Shop Now
                    </Link>
                  </div>
                </>
              )}

              {result.type === 'tryagain' && spinsLeft > 0 && (
                <button onClick={spin} style={{
                  width: '100%', marginTop: '4px', padding: '11px',
                  borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  fontFamily: '"DM Sans", sans-serif',
                }}>
                  Spin Again ({spinsLeft} left)
                </button>
              )}
            </div>
          )}

          {/* Prizes list */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                What's on the wheel
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {PRIZES.filter(p => p.type !== 'tryagain').map(prize => (
                <div key={prize.id} className="prize-row" style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px',
                  transition: 'background 0.15s', cursor: 'default',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: `${prize.color}12`, border: `1px solid ${prize.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px',
                  }}>
                    {prize.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {prize.label}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                      {prize.sub}
                    </div>
                  </div>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: prize.color, flexShrink: 0 }} />
                </div>
              ))}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', textAlign: 'center', marginTop: '20px' }}>
              3 free spins per day · Resets at midnight
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelPage;