import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiGift, FiAward, FiGlobe, FiTrendingUp, 
  FiArrowRight, FiCheckCircle, FiRepeat, FiMapPin, FiExternalLink, FiLock
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const RewardsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const points = user?.greenPoints ?? 100;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'badges', label: 'Badges & Tiers', icon: FiAward },
    { id: 'redeem', label: 'Redeem Coupons', icon: FiGift },
    { id: 'impact', label: 'Eco Impact', icon: FiGlobe },
  ];

  const earnWays = [
    { title: 'Buy Eco Products', pts: '+100 pts', icon: '🌱', desc: 'Shop verified eco-friendly items', action: 'Shop Now', link: '/products' },
    { title: 'Return Packaging', pts: '+50 pts', icon: '📦', desc: 'Hand back packaging during delivery', action: 'Recycling Center', link: '/recycling-center' },
    { title: 'Support Local Sellers', pts: '+30 pts', icon: '🏬', desc: 'Purchase from local Nepali artisans', action: 'Explore Sellers', link: '/products' },
    { title: 'Refer a Friend', pts: '+100 pts', icon: '👥', desc: 'Invite friends to shop sustainably', action: 'View Profile', link: '/profile' },
  ];

  const challenges = user?.monthlyChallenges || [
    { challengeKey: 'BUY_ECO', title: 'Buy 5 eco-friendly products', points: 150, currentCount: 0, targetCount: 5, isCompleted: false },
    { challengeKey: 'RETURN_PACKAGE', title: 'Return 2 packages for recycling', points: 100, currentCount: 0, targetCount: 2, isCompleted: false },
  ];

  const handleChallengeAction = (challengeKey) => {
    if (challengeKey === 'RETURN_PACKAGE') {
      navigate('/recycling-center');
    } else {
      navigate('/products');
    }
  };

  const coupons = [
    { code: 'ECO100', discount: 'NPR 100 OFF', cost: 100, desc: 'Valid on orders over NPR 1,000', type: 'fixed', value: 100 },
    { code: 'GREEN250', discount: 'NPR 250 OFF', cost: 250, desc: 'Valid on orders over NPR 2,000', type: 'fixed', value: 250 },
    { code: 'SAVE10', discount: '10% OFF', cost: 150, desc: 'Valid on any order subtotal', type: 'percent', value: 10 },
  ];

  const handleRedeemCoupon = (code) => {
    localStorage.setItem('applied_eco_coupon', code);
    toast.success(`Coupon ${code} activated! Redirecting to shop...`);
    setTimeout(() => {
      navigate('/products');
    }, 600);
  };

  const packagingRewards = [
    { id: 1, title: 'Glass bottles', icon: '🍾', reward: '50 pts or Rs. 20' },
    { id: 2, title: 'Cardboard boxes', icon: '📦', reward: '50 pts or Rs. 30' },
    { id: 3, title: 'Reusable containers', icon: '🫙', reward: '100 pts or Rs. 100' },
  ];

  const badges = [
    { id: 1, title: 'Green Beginner', desc: 'Made your first eco-friendly purchase', fallback: '🌱', unlocked: points >= 100 },
    { id: 2, title: 'Eco Explorer', desc: 'Earn 500 Green Points', fallback: '🌿', unlocked: points >= 500 },
    { id: 3, title: 'Planet Protector', desc: 'Earn 1,000 Green Points', fallback: '🌳', unlocked: points >= 1000 },
  ];

  const impactStats = [
    { title: 'Plastic Saved', value: '4.2 kg', icon: '🥤', detail: 'Equivalent to 210 single-use bottles' },
    { title: 'CO₂ Offset', value: '18.5 kg', icon: '🌍', detail: 'Equivalent to driving 75 km less' },
    { title: 'Trees Planted', value: '3 Trees', icon: '🌲', detail: 'Via our EcoMart Green Alliance' },
    { title: 'Boxes Recycled', value: '6 Packages', icon: '📦', detail: 'Returned to sellers for reuse' },
  ];

  const ecoPartners = [
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 pb-24 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8 shadow-2xl border border-emerald-700/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 inline-block">
                🌿 Green Loyalty Program
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white">Green Rewards Dashboard</h1>
              <p className="text-emerald-100/80 text-sm mt-1 max-w-lg">
                Welcome back, <strong className="text-amber-300">{user?.name || 'Eco Champion'}</strong>! Track your challenges and redeem discounts.
              </p>
              
              <div className="mt-4 inline-flex items-center gap-2 bg-slate-900/60 border border-emerald-500/30 px-4 py-2 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold">Your Referral Code:</span>
                <span className="font-mono font-bold text-amber-400">{user?.referralCode || 'ECO-NMRY3'}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user?.referralCode || 'ECO-NMRY3');
                    toast.success('Referral code copied!');
                  }}
                  className="ml-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded transition cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-slate-950/70 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 min-w-[240px] text-center shadow-inner">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Balance</span>
              <div className="flex items-center justify-center gap-2 my-1">
                <span className="text-4xl font-black text-white">{points}</span>
                <span className="text-2xl">🌿</span>
              </div>
              <p className="text-xs text-slate-400">Green Points Available</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-4">⚡ Ways to Earn Points</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {earnWays.map((way, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-3xl">{way.icon}</span>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                          {way.pts}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base mb-1">{way.title}</h3>
                      <p className="text-xs text-slate-400 mb-4">{way.desc}</p>
                    </div>

                    <button 
                      onClick={() => navigate(way.link)}
                      className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {way.action} <FiArrowRight size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🎯 Active Eco Challenges
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Complete tasks to automatically sync your progress with database records.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {challenges.map((challenge, idx) => {
                  const progressPercent = Math.min(100, (challenge.currentCount / challenge.targetCount) * 100);
                  return (
                    <div 
                      key={idx}
                      className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                            +{challenge.points} pts
                          </span>
                          <span className="text-xs font-semibold text-slate-400 font-mono">
                            {challenge.currentCount} / {challenge.targetCount} completed
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base mb-1">{challenge.title}</h3>
                        
                        <div className="w-full bg-slate-800 h-2 rounded-full my-3 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleChallengeAction(challenge.challengeKey)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          challenge.isCompleted 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        }`}
                      >
                        {challenge.isCompleted ? 'Completed ✓' : 'Fulfill Task'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
                  🤝
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Our Certified Eco Partners</h2>
                  <p className="text-xs text-slate-400">Collaborating with trusted leaders for sustainable waste management</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {ecoPartners.map((partner, idx) => (
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
                      <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                        {partner.name}
                        <FiExternalLink size={14} className="text-slate-500 group-hover:text-emerald-400" />
                      </h3>
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
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid md:grid-cols-3 gap-6">
            {badges.map((b) => (
              <div key={b.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center flex flex-col justify-between">
                <div>
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl bg-slate-950 border ${b.unlocked ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'border-slate-800 opacity-50'}`}>
                    {b.fallback}
                  </div>
                  <h3 className="font-bold text-white mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-400 mb-4">{b.desc}</p>
                </div>
                
                <div>
                  {b.unlocked ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      <FiCheckCircle size={13} /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                      <FiLock size={13} /> Locked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'redeem' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">🎟️ Checkout Discount Coupons</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {coupons.map((c, i) => {
                  const canAfford = points >= c.cost;
                  return (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-2xl font-black text-amber-300">{c.discount}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${canAfford ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {c.cost} pts
                          </span>
                        </div>
                        <p className="font-mono text-sm font-bold text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-800 inline-block mb-2">
                          {c.code}
                        </p>
                        <p className="text-xs text-slate-400 mb-6">{c.desc}</p>
                      </div>

                      <button
                        disabled={!canAfford}
                        onClick={() => handleRedeemCoupon(c.code)}
                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          canAfford ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem & Shop' : `Need ${c.cost - points} More Pts`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl">
                  ♻️
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Packaging Cashback</h2>
                  <p className="text-xs text-slate-400">Return packaging during delivery and earn direct rewards or cashback</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {packagingRewards.map((item) => (
                  <div key={item.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-bold text-white text-sm">{item.title}</span>
                    </div>
                    <span className="font-bold text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      {item.reward}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/recycling-center')}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                <FiRepeat size={16} /> Visit Recycling Center
              </button>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
                <span className="text-4xl block mb-2">{stat.icon}</span>
                <span className="text-2xl font-black text-emerald-400 block mb-1">{stat.value}</span>
                <h3 className="font-bold text-white text-sm mb-1">{stat.title}</h3>
                <p className="text-xs text-slate-400">{stat.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;