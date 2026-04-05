import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Award, TrendingUp, DollarSign, Briefcase, ChevronRight, Clock, Lock, Brain, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const bidStatusBadge = (status) => {
  const map = { won: 'badge-green', lost: 'badge-red', active: 'badge-blue', pending: 'badge-yellow' };
  return <span className={`${map[status] || 'badge-gray'} text-xs`}>{status?.toUpperCase()}</span>;
};

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [bids, setBids]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projects?limit=6'),
      api.get('/projects/my/bids').catch(() => ({ data: { data: [] } }))
    ]).then(([proj, bidsRes]) => {
      setProjects(proj.data.data || []);
      setBids(bidsRes.data.data || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const wonBids    = bids.filter(b => b.status === 'won').length;
  const activeBids = bids.filter(b => b.status === 'active' || b.status === 'pending').length;
  const aiScore    = user?.aiScore || 0;
  const totalEarned = user?.totalEarned || 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Win bids with AI-powered insights and smart feedback</p>
        </div>
        <Link to="/projects" className="btn-primary">
          <Search size={15}/> Browse Projects
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'AI Score',     value: `${aiScore}/100`,                   icon: Award,     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Active Bids',  value: activeBids,                         icon: TrendingUp, color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20' },
          { label: 'Projects Won', value: wonBids,                            icon: Briefcase,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Earned', value: `₹${totalEarned.toLocaleString()}`, icon: DollarSign, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={18} className={color}/>
            </div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-slate-500 text-sm mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Score ring card */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5"/>
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="2.5"
                strokeDasharray={`${aiScore} 100`} strokeLinecap="round"
                className="transition-all duration-1000"/>
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1"/>
                  <stop offset="100%" stopColor="#22D3EE"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black gradient-text">{aiScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-lg">Your AI Score</h3>
              <Brain size={16} className="text-primary"/>
            </div>
            <p className="text-slate-400 text-sm mb-3">
              Cumulative score from {user?.quizCount || 0} AI quiz{user?.quizCount !== 1 ? 'zes' : ''}. Higher score = better recommendation ranking and more project wins.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {aiScore >= 80 && <span className="badge-green flex items-center gap-1"><Star size={10}/> Top Performer</span>}
              {aiScore >= 60 && aiScore < 80 && <span className="badge-blue">Good Standing</span>}
              {aiScore < 60 && aiScore > 0 && <span className="badge-yellow">Keep Improving</span>}
              {aiScore === 0 && <span className="badge-gray">Take a quiz to get scored</span>}
              <Link to="/projects" className="text-primary text-xs hover:underline">
                Take a quiz →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Available Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Available Projects</h2>
          <Link to="/projects" className="text-primary text-sm hover:underline flex items-center gap-1">
            View All <ChevronRight size={13}/>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="glass-card h-44 shimmer"/>)}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Briefcase size={36} className="text-slate-600 mx-auto mb-3"/>
            <p className="text-slate-400">No projects available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <span className={p.status === 'bidding' ? 'badge-red' : 'badge-blue'}>
                    {p.status === 'bidding' ? '🔴 LIVE' : 'Open'}
                  </span>
                  {p.closedCommunity?.enabled && <span className="badge-purple flex items-center gap-1"><Lock size={10}/> Private</span>}
                </div>
                <h3 className="font-semibold text-slate-200 mb-2 leading-snug line-clamp-2">{p.title}</h3>
                <p className="text-slate-500 text-xs mb-3 line-clamp-2 flex-1">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.skills?.slice(0, 3).map(s => <span key={s} className="badge-indigo text-xs">{s}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Budget: <span className="text-emerald-400 font-semibold">₹{p.budget?.toLocaleString()}</span></span>
                  <Link to={`/projects/${p._id}`} className="btn-primary py-1.5 px-3 text-xs">View →</Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bids */}
      {bids.length > 0 && (
        <div>
          <h2 className="section-title mb-4">My Recent Bids</h2>
          <div className="space-y-2">
            {bids.slice(0, 5).map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200 text-sm">{b.projectId?.title || 'Project'}</div>
                  <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                    <Clock size={11}/> {new Date(b.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-white">₹{b.bidAmount?.toLocaleString()}</div>
                  </div>
                  {bidStatusBadge(b.status)}
                  {b.projectId?._id && (
                    <Link to={`/projects/${b.projectId._id}`} className="text-primary text-xs hover:underline">View</Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
