import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiMapPin, FiClock, FiCheckCircle, 
  FiCalendar, FiPlus, FiMinus, FiSend, FiAward, FiShield, FiTrendingUp, FiExternalLink 
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const RECYCLING_STATS = {
  bottles: 12480,
  cardboard: 8930,
  glass: 4210,
  plastic: 15670,
  aluminum: 2340,
  ewaste: 235,
  trees: 128,
  co2Saved: '25 tons',
  waterSaved: '1.2M liters',
  energySaved: '85,000 kWh',
};

const RECENT_DROPOFFS = [
  { id: 1, user: 'Ritesh B.', items: '12 plastic bottles', type: 'PET', date: 'Today, 10:30 AM', points: 60 },
  { id: 2, user: 'Sunita K.', items: '5 cardboard boxes', type: 'Cardboard', date: 'Today, 9:15 AM', points: 25 },
  { id: 3, user: 'Aarav S.', items: '8 glass bottles', type: 'Glass', date: 'Yesterday, 4:45 PM', points: 40 },
  { id: 4, user: 'Priya M.', items: '3 old electronics', type: 'E-Waste', date: 'Yesterday, 2:20 PM', points: 150 },
  { id: 5, user: 'David G.', items: '20 aluminum cans', type: 'Aluminum', date: '2 days ago', points: 100 },
  { id: 6, user: 'Nisha T.', items: '15 plastic containers', type: 'Plastic', date: '2 days ago', points: 75 },
];

const COLLECTION_POINTS = [
  { id: 1, name: 'ShopMart - Thamel', address: 'Thamel Marg, Kathmandu', hours: '9 AM - 8 PM', phone: '01-4445555', badge: 'Main Hub' },
  { id: 2, name: 'ShopMart - Baneshwor', address: 'Baneshwor, Kathmandu', hours: '9 AM - 8 PM', phone: '01-4466777', badge: 'Express Drop' },
  { id: 3, name: 'ShopMart - Lazimpat', address: 'Lazimpat, Kathmandu', hours: '10 AM - 7 PM', phone: '01-4422333', badge: 'Verified Partner' },
  { id: 4, name: 'ShopMart - Pokhara', address: 'Lake Side, Pokhara', hours: '10 AM - 8 PM', phone: '061-456789', badge: 'Regional Center' },
];

const ECO_PARTNERS = [
  {
    name: 'Doko Recyclers',
    location: 'Kathmandu, Nepal',
    logo: '/assets/partners/doko-recyclers.png',
    url: 'https://dokorecyclers.com/',
    desc: "Kathmandu's leading waste management & recycling service provider.",
  },
  {
    name: 'Eco Dosti',
    location: 'Lalitpur, Nepal',
    logo: '/assets/partners/eco-dosti.png',
    url: 'https://www.ecodosti.com.np/',
    desc: 'Promoting zero-waste alternatives and sustainable green products.',
  },
  {
    name: 'Himali Green',
    location: 'Pokhara, Nepal',
    logo: '/assets/partners/himali-green.png',
    url: 'https://www.himaligreen.com/',
    desc: 'Environmental conservation and green community initiatives across the Himalayas.',
  },
];

const MATERIAL_INFO = [
  { type: 'Plastic Bottles', key: 'plastic_bottles', emoji: '🧴', req: 'Clean & empty PET bottles', points: '+5 pts each', desc: 'Recycled into new bottles and polyester fabric' },
  { type: 'Plastic Bags', key: 'plastic_bags', emoji: '🛍️', req: 'Clean & dry plastic bags', points: '+3 pts each', desc: 'Recycled into new bags and plastic lumber' },
  { type: 'Cardboard Boxes', key: 'cardboard', emoji: '📦', req: 'Flattened, tape removed', points: '+5 pts each', desc: 'Recycled into new packaging paper and boxes' },
  { type: 'Glass Bottles', key: 'glass', emoji: '🍾', req: 'Rinsed, labels removed', points: '+8 pts each', desc: 'Crushed and remelted into new glass products' },
  { type: 'Aluminum Cans', key: 'aluminum', emoji: '🥤', req: 'Rinsed & crushed', points: '+5 pts each', desc: '100% infinitely recyclable into new cans' },
  { type: 'Paper', key: 'paper', emoji: '📄', req: 'Clean & dry paper', points: '+2 pts each', desc: 'Recycled into new paper products' },
  { type: 'E-Waste', key: 'ewaste', emoji: '💻', req: 'Old phones, laptops, chargers', points: '+50 pts each', desc: 'Safe disposal and precious metal recovery' },
  { type: 'Reusable Containers', key: 'reusable_containers', emoji: '🫙', req: 'Clean containers for refill', points: '+10 pts each', desc: 'Refilled and reused — zero waste' },
];

const FORMAT = (n) => n.toLocaleString('en-US');

const RecyclingCenterPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const [quantities, setQuantities] = useState({});
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'submit', label: 'Submit Drop-off', icon: FiAward },
    { id: 'materials', label: 'Materials Guide', icon: FiShield },
    { id: 'locations', label: 'Drop-off Points', icon: FiMapPin },
  ];

  const adjustQty = (key, delta) => {
    setQuantities(prev => {
      const next = Math.max(0, (prev[key] || 0) + delta);
      return { ...prev, [key]: next };
    });
  };

  const totalSelectedItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  const handleSubmitRecycling = async () => {
    if (!user) {
      toast.error('Please login to submit recycling');
      return;
    }
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemType, quantity]) => ({ itemType, quantity }));

    if (items.length === 0) {
      toast.error('Add at least one item before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/recycling', { items, dropOffLocation, note });
      setLastResult({
        totalPoints: res.data.record?.totalPointsAwarded ?? 0,
        message: res.data.message,
      });
      toast.success(res.data.message || 'Recycling submitted successfully!');
      setQuantities({});
      setDropOffLocation('');
      setNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit recycling');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── HEADER BANNER ── */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <Link 
              to="/" 
              className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all shadow-md group"
            >
              <FiArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-1">
                Eco Alliance ♻️
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Recycling Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-emerald-500/30 rounded-2xl px-5 py-3 shadow-inner relative z-10 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-2xl animate-pulse">🌳</span>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Funded Trees</div>
              <div className="text-emerald-400 font-black text-lg">{FORMAT(RECYCLING_STATS.trees)}</div>
            </div>
          </div>
        </motion.div>

        {/* ── PREMIUM TABS NAVIGATION ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT TRANSITIONS ── */}
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* HERO STATS CARD */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-8 border border-emerald-500/30 shadow-2xl text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <span className="text-5xl block mb-3 animate-bounce">♻️</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  {FORMAT(RECYCLING_STATS.bottles + RECYCLING_STATS.cardboard + RECYCLING_STATS.glass + RECYCLING_STATS.plastic + RECYCLING_STATS.aluminum + RECYCLING_STATS.ewaste)} Items Recycled
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mb-8">
                  Successfully collected & processed through ShopMart's Green Program in collaboration with our certified ecological partners.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { emoji: '🥤', stat: FORMAT(RECYCLING_STATS.bottles + RECYCLING_STATS.plastic), label: 'Plastic Items' },
                    { emoji: '📦', stat: FORMAT(RECYCLING_STATS.cardboard), label: 'Cardboards' },
                    { emoji: '🍾', stat: FORMAT(RECYCLING_STATS.glass), label: 'Glass Bottles' },
                    { emoji: '🌳', stat: FORMAT(RECYCLING_STATS.trees), label: 'Trees Funded' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
                      <span className="text-2xl block mb-1">{item.emoji}</span>
                      <div className="text-emerald-400 font-black text-base">{item.stat}</div>
                      <div className="text-slate-400 text-[11px] font-medium mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENVIRONMENTAL IMPACT GRID */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
                    🌍
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Community Ecological Impact</h3>
                    <p className="text-xs text-slate-400">Measured savings achieved by our active users</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { emoji: '🌍', stat: RECYCLING_STATS.co2Saved, label: 'CO₂ Emissions Avoided', desc: 'Equivalent to cleaner urban air' },
                    { emoji: '💧', stat: RECYCLING_STATS.waterSaved, label: 'Water Resources Saved', desc: 'Preserved clean groundwater' },
                    { emoji: '⚡', stat: RECYCLING_STATS.energySaved, label: 'Energy Conserved', desc: 'Saved via material reprocessing' },
                    { emoji: '🌳', stat: `${FORMAT(RECYCLING_STATS.trees)} Planted`, label: 'Greenhood Nepal Initiative', desc: 'Active community reforestation' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex items-start gap-4 hover:border-emerald-500/40 transition-all">
                      <span className="text-3xl p-2.5 bg-slate-900 rounded-xl border border-slate-800">{item.emoji}</span>
                      <div>
                        <div className="text-emerald-400 font-black text-lg">{item.stat}</div>
                        <div className="text-white text-xs font-bold mt-0.5">{item.label}</div>
                        <div className="text-slate-400 text-[11px] mt-1">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT DROPOFFS FEED */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FiClock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Live Community Feed</h3>
                    <p className="text-xs text-slate-400">Recent recycling contributions from members</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {RECENT_DROPOFFS.map((item) => (
                    <div key={item.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                          {item.type === 'PET' ? '🧴' : item.type === 'Cardboard' ? '📦' : item.type === 'Glass' ? '🍾' : item.type === 'E-Waste' ? '💻' : item.type === 'Aluminum' ? '🥤' : '🫙'}
                        </span>
                        <div>
                          <div className="text-slate-200 text-xs sm:text-sm font-semibold">
                            <strong className="text-white font-bold">{item.user}</strong> dropped off {item.items}
                          </div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <FiCalendar size={11} /> {item.date}
                          </div>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap">
                        +{item.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CERTIFIED PARTNERS SECTION */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Our Certified Eco Partners</h3>
                    <p className="text-xs text-slate-400">Collaborating with trusted leaders for sustainable waste management</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {ECO_PARTNERS.map((partner, idx) => (
                    <a
                      key={idx}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:-translate-y-1 transition-all group cursor-pointer"
                    >
                      <div>
                        <div className="w-full h-16 rounded-xl bg-white flex items-center justify-center p-3 mb-4 shadow-sm">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                          {partner.name}
                          <FiExternalLink size={14} className="text-slate-500 group-hover:text-emerald-400" />
                        </h4>
                        <p className="text-emerald-400 text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                          <FiMapPin size={11} /> {partner.location}
                        </p>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                          {partner.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                        <span>Visit Website</span>
                        <span>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBMIT DROP-OFF TAB */}
          {activeTab === 'submit' && (
            <motion.div 
              key="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {lastResult && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4">
                  <span className="text-3xl">🎉</span>
                  <div>
                    <h4 className="font-bold text-emerald-300 text-sm">Recycling Submission Successful!</h4>
                    <p className="text-xs text-emerald-200/80">You've successfully added <strong className="text-white">{lastResult.totalPoints} Green Points</strong> to your wallet balance.</p>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    📝
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Log Your Recyclable Items</h3>
                    <p className="text-xs text-slate-400">Choose item quantities to compute your green reward points</p>
                  </div>
                </div>

                {!user && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-2xl p-4 mb-6">
                    ⚠️ Please <Link to="/login" className="underline font-bold">login to your account</Link> to submit items and sync points to your profile.
                  </div>
                )}

                {/* Material Quantities Grid */}
                <div className="grid sm:grid-cols-2 gap-3.5 mb-6">
                  {MATERIAL_INFO.map((mat) => (
                    <div key={mat.key} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">{mat.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="text-white text-xs font-bold truncate">{mat.type}</h4>
                          <span className="text-emerald-400 text-[11px] font-semibold">{mat.points}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => adjustQty(mat.key, -1)}
                          className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-all"
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="w-6 text-center font-black text-white text-sm">
                          {quantities[mat.key] || 0}
                        </span>
                        <button
                          onClick={() => adjustQty(mat.key, 1)}
                          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer transition-all shadow-md shadow-emerald-600/20"
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Location & Note inputs */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-slate-300 text-xs font-bold mb-1.5">Drop-off Location / Hub (Optional)</label>
                    <input
                      type="text"
                      value={dropOffLocation}
                      onChange={(e) => setDropOffLocation(e.target.value)}
                      placeholder="e.g. ShopMart - Thamel"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold mb-1.5">Additional Notes (Optional)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Any specific instructions or details regarding your items..."
                      rows={3}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitRecycling}
                  disabled={submitting || totalSelectedItems === 0 || !user}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    submitting || totalSelectedItems === 0 || !user
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25'
                  }`}
                >
                  <FiSend size={15} />
                  {submitting ? 'Processing Submission...' : `Submit Items (${totalSelectedItems} Selected)`}
                </button>
              </div>
            </motion.div>
          )}

          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <motion.div 
              key="materials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Accepted Materials & Guidelines</h3>
                    <p className="text-xs text-slate-400">Review preparation standards to qualify for full point awards</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {MATERIAL_INFO.map((mat, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">{mat.emoji}</span>
                            <div>
                              <h4 className="text-white font-bold text-sm">{mat.type}</h4>
                              <span className="text-slate-400 text-[11px]">{mat.req}</span>
                            </div>
                          </div>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-xl">
                            {mat.points}
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-400 text-xs bg-slate-900/80 border border-slate-800/60 rounded-xl p-3 mt-3">
                        🔄 <span className="text-slate-300 font-medium">{mat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* LOCATIONS TAB */}
          {activeTab === 'locations' && (
            <motion.div 
              key="locations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    📍
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Collection Centers & Drop-off Points</h3>
                    <p className="text-xs text-slate-400">Visit any physical ShopMart partner hub to drop off recyclables</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {COLLECTION_POINTS.map((point) => (
                    <div key={point.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-white font-bold text-sm flex items-center gap-2">
                            <FiMapPin className="text-emerald-400 shrink-0" size={16} />
                            {point.name}
                          </h4>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {point.badge}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mb-4 pl-6">{point.address}</p>
                      </div>

                      <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-300 pl-6">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <FiClock size={13} /> {point.hours}
                        </span>
                        <span className="text-slate-400">📞 {point.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 flex items-center gap-4">
                  <span className="text-3xl shrink-0">🚚</span>
                  <div>
                    <h4 className="font-bold text-emerald-300 text-xs sm:text-sm">Doorstep Bulk Pickup Available</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Got 10+ items ready for recycling? Schedule a free direct doorstep collection via Doko Recyclers support.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer info */}
        <p className="text-center text-slate-500 text-xs pb-6">
          ♻️ Empowering Sustainable Futures with Doko Recyclers, Eco Dosti & Himali Green
        </p>

      </div>
    </div>
  );
};

export default RecyclingCenterPage;