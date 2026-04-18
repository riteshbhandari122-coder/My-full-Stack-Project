import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiCheck, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PRIZES = [
  { id: 1, label: 'Headphones',  sub: 'Win free headphones!',    emoji: '🎧', color: '#f59e0b', dark: '#92400e', type: 'prize',    code: 'WIN-HEADPHONES' },
  { id: 2, label: '50% OFF',     sub: 'Half price on any order', emoji: '🏷️', color: '#ef4444', dark: '#991b1b', type: 'coupon',   code: 'SPIN50' },
  { id: 3, label: 'Smart Watch', sub: 'Win a free smartwatch!',  emoji: '⌚', color: '#3b82f6', dark: '#1e40af', type: 'prize',    code: 'WIN-WATCH' },
  { id: 4, label: '30% OFF',     sub: 'Save on your next order', emoji: '💸', color: '#10b981', dark: '#065f46', type: 'coupon',   code: 'SPIN30' },
  { id: 5, label: 'Try Again',   sub: 'Better luck next time!',  emoji: '🔄', color: '#6b7280', dark: '#374151', type: 'tryagain', code: null },
];

const TOTAL = PRIZES.length;
const SLICE = (2 * Math.PI) / TOTAL;

function drawWheel(canvas, rotation) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  ctx.clearRect(0, 0, size, size);

  // Outer glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, 2 * Math.PI);
  ctx.fillStyle = '#0a1220';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(245,158,11,0.3)';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, 2 * Math.PI);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  PRIZES.forEach((prize, i) => {
    const startAngle = rotation + i * SLICE - Math.PI / 2;
    const endAngle   = rotation + (i + 1) * SLICE - Math.PI / 2;
    const midAngle   = (startAngle + endAngle) / 2;

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? prize.dark : shadeColor(prize.dark, -15);
    ctx.fill();

    // Colored outer edge
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = prize.color;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Divider
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Emoji — large, at outer area
    const emojiR = r * 0.75;
    const ex = cx + emojiR * Math.cos(midAngle);
    const ey = cy + emojiR * Math.sin(midAngle);
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.font = `${Math.round(size * 0.075)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prize.emoji, 0, 0);
    ctx.restore();

    // Label text — bold, white, large
    const labelR = r * 0.46;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = prize.type === 'tryagain' ? 'rgba(255,255,255,0.5)' : '#ffffff';
    ctx.font = `700 ${Math.round(size * 0.048)}px "Syne", sans-serif`;
    ctx.fillText(prize.label, 0, 0);
    ctx.restore();
  });

  // Center hub outer ring
  const hubR = size * 0.12;
  ctx.beginPath();
  ctx.arc(cx, cy, hubR + 4, 0, 2 * Math.PI);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();

  // Center hub fill
  const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR);
  hubGrad.addColorStop(0, '#1e2d45');
  hubGrad.addColorStop(1, '#0f1b2d');
  ctx.beginPath();
  ctx.arc(cx, cy, hubR, 0, 2 * Math.PI);
  ctx.fillStyle = hubGrad;
  ctx.fill();

  // Center text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f59e0b';
  ctx.font = `800 ${Math.round(size * 0.038)}px "Syne", sans-serif`;
  ctx.fillText('SPIN', cx, cy - size * 0.022);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `500 ${Math.round(size * 0.028)}px "DM Sans", sans-serif`;
  ctx.fillText('& WIN', cx, cy + size * 0.025);
}

function shadeColor(hex, amount) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

const SpinWheelPage = () => {
  const canvasRef = useRef(null);
  const rotRef    = useRef(0);
  const rafRef    = useRef(null);

  const [spinning,   setSpinning]   = useState(false);
  const [result,     setResult]     = useState(null);
  const [spinsLeft,  setSpinsLeft]  = useState(3);
  const [copied,     setCopied]     = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wheelSize,  setWheelSize]  = useState(460);

  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth - 40, 500);
      setWheelSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = wheelSize;
    canvas.height = wheelSize;
    drawWheel(canvas, rotRef.current);
  }, [wheelSize]);

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;
    setResult(null);
    setShowResult(false);
    setSpinning(true);
    setSpinsLeft(s => s - 1);

    const winnable  = PRIZES.map((p, i) => i).filter(i => PRIZES[i].type !== 'tryagain');
    const losers    = PRIZES.map((p, i) => i).filter(i => PRIZES[i].type === 'tryagain');
    const roll      = Math.random();
    const idx       = roll < 0.70
      ? winnable[Math.floor(Math.random() * winnable.length)]
      : losers[Math.floor(Math.random() * losers.length)];

    const sliceRad  = SLICE;
    const targetRad = -(idx * sliceRad + sliceRad / 2);
    const curRad    = rotRef.current;
    const extraSpin = (6 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const finalRad  = curRad + extraSpin + (targetRad - (curRad % (2 * Math.PI)));

    const start    = performance.now();
    const duration = 5000;
    const startRot = rotRef.current;
    const easeOut  = t => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
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
          toast.success(`🎉 You won: ${PRIZES[idx].label}!`);
        }
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  const copyCode = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code).then(() => {
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a1220', fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.9); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes bounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%      { transform:translateX(-50%) translateY(-6px); }
        }
        .spin-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow: 0 8px 28px rgba(245,158,11,0.5) !important; }
        .spin-btn:active:not(:disabled) { transform:scale(0.97); }
        .copy-btn:hover { opacity:0.85; }
      `}</style>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'32px', animation:'fadeUp 0.4s ease' }}>
          <Link to="/" style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.6)', textDecoration:'none' }}>
            <FiArrowLeft size={17} />
          </Link>
          <div style={{ flex:1 }}>
            <h1 style={{ margin:0, fontFamily:'"Syne",sans-serif', fontWeight:800, fontSize:'clamp(1.5rem,5vw,2rem)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1 }}>
              Spin & <span style={{ color:'#f59e0b' }}>Win</span>
            </h1>
            <p style={{ margin:'4px 0 0', color:'rgba(255,255,255,0.35)', fontSize:'0.82rem' }}>
              {spinsLeft > 0 ? `${spinsLeft} spin${spinsLeft > 1 ? 's' : ''} left today` : 'Come back tomorrow for more spins!'}
            </p>
          </div>
          <div style={{ display:'flex', gap:'5px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:'9px', height:'9px', borderRadius:'50%', background: i < spinsLeft ? '#f59e0b' : 'rgba(255,255,255,0.1)', boxShadow: i < spinsLeft ? '0 0 6px rgba(245,158,11,0.6)' : 'none', transition:'all 0.3s' }} />
            ))}
          </div>
        </div>

        {/* Wheel */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'24px', animation:'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            {/* Arrow pointer */}
            <div style={{
              position:'absolute', top:'-14px', left:'50%',
              transform:'translateX(-50%)',
              width:0, height:0,
              borderLeft:'13px solid transparent',
              borderRight:'13px solid transparent',
              borderTop:'26px solid #f59e0b',
              zIndex:10,
              filter:'drop-shadow(0 3px 8px rgba(245,158,11,0.6))',
              animation: spinning ? 'none' : 'bounce 1.8s ease-in-out infinite',
            }} />

            <canvas
              ref={canvasRef}
              width={wheelSize}
              height={wheelSize}
              onClick={spin}
              style={{
                borderRadius:'50%',
                display:'block',
                cursor: spinning || spinsLeft === 0 ? 'not-allowed' : 'pointer',
                opacity: spinsLeft === 0 && !spinning ? 0.45 : 1,
                transition:'opacity 0.3s',
              }}
            />
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={spinning || spinsLeft === 0}
            className="spin-btn"
            style={{
              padding:'14px 52px', borderRadius:'14px', border:'none',
              background: spinning || spinsLeft === 0
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: spinning || spinsLeft === 0 ? 'rgba(255,255,255,0.2)' : '#0f1b2d',
              fontFamily:'"Syne",sans-serif', fontWeight:800, fontSize:'1.05rem',
              cursor: spinning || spinsLeft === 0 ? 'not-allowed' : 'pointer',
              letterSpacing:'-0.01em',
              boxShadow: spinning || spinsLeft === 0 ? 'none' : '0 4px 20px rgba(245,158,11,0.4)',
              transition:'all 0.2s',
            }}
          >
            {spinning ? '🌀 Spinning...' : spinsLeft === 0 ? 'No spins left today' : '🎰 Spin the Wheel'}
          </button>

          {/* Result */}
          {showResult && result && (
            <div style={{
              width:'100%', borderRadius:'18px', padding:'22px',
              background: result.type === 'tryagain' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${result.type === 'tryagain' ? 'rgba(255,255,255,0.07)' : result.color + '33'}`,
              animation:'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom: result.code ? '18px' : 0 }}>
                <div style={{ width:'50px', height:'50px', borderRadius:'14px', flexShrink:0, background:`${result.color}18`, border:`1px solid ${result.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>
                  {result.emoji}
                </div>
                <div>
                  <div style={{ color: result.type === 'tryagain' ? 'rgba(255,255,255,0.45)' : '#fff', fontFamily:'"Syne",sans-serif', fontWeight:700, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>
                    {result.type === 'tryagain' ? 'Try Again!' : `You won ${result.label}!`}
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.82rem', marginTop:'2px' }}>{result.sub}</div>
                </div>
              </div>

              {result.code && (
                <>
                  <div style={{ background:'rgba(0,0,0,0.3)', border:`1px dashed ${result.color}44`, borderRadius:'12px', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                    <div>
                      <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'3px' }}>Your Code</div>
                      <div style={{ color:result.color, fontFamily:'"Syne",sans-serif', fontWeight:800, fontSize:'1.15rem', letterSpacing:'0.07em' }}>{result.code}</div>
                    </div>
                    <button className="copy-btn" onClick={copyCode} style={{ width:'36px', height:'36px', borderRadius:'10px', background:`${result.color}18`, border:`1px solid ${result.color}30`, color:result.color, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity 0.2s' }}>
                      {copied ? <FiCheck size={15}/> : <FiCopy size={15}/>}
                    </button>
                  </div>
                  <div style={{ display:'flex', gap:'10px' }}>
                    <button onClick={copyCode} style={{ flex:1, padding:'11px', borderRadius:'11px', border:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.65)', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', fontFamily:'"DM Sans",sans-serif' }}>
                      {copied ? <FiCheck size={13}/> : <FiCopy size={13}/>} {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                    <Link to="/products" style={{ flex:1, padding:'11px', borderRadius:'11px', border:'none', background:`linear-gradient(135deg,${result.color},${result.color}cc)`, color:'#0f1b2d', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', textDecoration:'none', fontFamily:'"Syne",sans-serif' }}>
                      <FiShoppingBag size={13}/> Shop Now
                    </Link>
                  </div>
                </>
              )}

              {result.type === 'tryagain' && spinsLeft > 0 && (
                <button onClick={spin} style={{ width:'100%', marginTop:'4px', padding:'11px', borderRadius:'11px', border:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.55)', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', fontFamily:'"DM Sans",sans-serif' }}>
                  Spin Again ({spinsLeft} left)
                </button>
              )}
            </div>
          )}

          {/* Prize list */}
          <div style={{ width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }} />
              <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.09em' }}>Prizes</span>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {PRIZES.map(prize => (
                <div key={prize.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`${prize.color}15`, border:`1px solid ${prize.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>
                    {prize.emoji}
                  </div>
                  <div>
                    <div style={{ color: prize.type === 'tryagain' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)', fontWeight:600, fontSize:'0.82rem' }}>{prize.label}</div>
                    <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.7rem' }}>{prize.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ color:'rgba(255,255,255,0.18)', fontSize:'0.72rem', textAlign:'center', marginTop:'16px' }}>
              3 free spins per day · Resets at midnight
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelPage;