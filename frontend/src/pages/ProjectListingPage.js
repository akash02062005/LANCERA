import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Clock, Users, Lock, ChevronRight, X, SlidersHorizontal, Sparkles, TrendingUp, Zap } from 'lucide-react';
import api from '../utils/api';

const SKILLS = ['React.js', 'Node.js', 'Python', 'MongoDB', 'Vue.js', 'Angular', 'Flutter', 'Laravel', 'Django', 'UI/UX', 'TypeScript', 'PostgreSQL'];

export default function ProjectListingPage() {
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '', skill: '', minBudget: '', maxBudget: '', sort: 'newest', closed: 'false'
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      });
      const { data } = await api.get(`/projects?${params}`);
      setProjects(data.data || []);
      setTotal(data.total || 0);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const setFilter = (key, val) => {
    setPage(1);
    setFilters(f => ({ ...f, [key]: val }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({ search: '', skill: '', minBudget: '', maxBudget: '', sort: 'newest', closed: 'false' });
  };

  const activeFilterCount = [filters.skill, filters.minBudget, filters.maxBudget].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#030B18]">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 mesh-bg opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-4">
              <Sparkles size={12}/> AI-POWERED DISCOVERY
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Win Your Next <span className="gradient-text">Big Project</span>.
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Browse through thousands of high-quality projects. Our AI matches your skills
              with the best opportunities automatically.
            </p>

            {/* Quick Stats Overlay */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
              {[
                { label: 'Active Projects', value: total, icon: Zap },
                { label: 'Total Bids', value: '4.2k+', icon: TrendingUp },
                { label: 'Avg. Win Rate', value: '78%', icon: Sparkles }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 glass-card px-5 py-3 border-white/5">
                  <stat.icon size={18} className="text-primary" />
                  <div className="text-left">
                    <div className="text-white font-bold leading-none">{stat.value}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"/>
              <input
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                placeholder="Search by title, skill, or keyword..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-14 py-5 text-lg text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all shadow-2xl"
              />
              {filters.search && (
                <button onClick={() => setFilter('search', '')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={18}/>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold ${
                showFilters || activeFilterCount > 0 
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-glow-sm' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
              }`}>
              <SlidersHorizontal size={16}/>
              Filters
              {activeFilterCount > 0 && <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1">{activeFilterCount}</span>}
            </button>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['newest', 'budget_desc', 'budget_asc'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setFilter('sort', s)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    filters.sort === s ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-slate-500 text-sm font-medium">
            Showing <span className="text-white font-bold">{projects.length}</span> of {total} projects
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="glass-card-dark p-6 border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Min Budget (₹)</label>
                    <input type="number" value={filters.minBudget} onChange={e => setFilter('minBudget', e.target.value)} placeholder="0" className="input-field py-2.5 bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Max Budget (₹)</label>
                    <input type="number" value={filters.maxBudget} onChange={e => setFilter('maxBudget', e.target.value)} placeholder="No limit" className="input-field py-2.5 bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Privacy</label>
                    <div className="flex gap-2">
                      {['false', 'true', ''].map(v => (
                        <button key={v} onClick={() => setFilter('closed', v)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${filters.closed === v ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                          {v === 'false' ? 'Public' : v === 'true' ? 'Private' : 'All'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button onClick={clearFilters} className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all">
                      Clear All Filters
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 block">Quick Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(s => (
                      <button key={s} onClick={() => setFilter('skill', filters.skill === s ? '' : s)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                          filters.skill === s
                            ? 'bg-primary border-primary text-white shadow-glow-sm'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-card-dark h-72 shimmer rounded-3xl border-white/5"/>)}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card-dark py-24 text-center border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-600"/>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No projects found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">Try adjusting your search terms or filters to find what you're looking for.</p>
            <button onClick={clearFilters} className="btn-primary py-3 px-8 text-sm">Clear All Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <motion.div key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
                
                <div className="glass-card-dark p-6 h-full flex flex-col border-white/5 group-hover:border-white/20 group-hover:shadow-premium transition-all duration-300">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                       {p.status === 'bidding' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-black tracking-widest border border-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot"/> LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest border border-emerald-500/20 uppercase">Open</span>
                      )}
                      {p.closedCommunity?.enabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black tracking-widest border border-purple-500/20 uppercase"><Lock size={10}/> Private</span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter italic opacity-50">
                      {new Date(p.bidStartTime).toLocaleDateString()} — {new Date(p.bidStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed opacity-80">{p.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {p.skills?.slice(0, 3).map(s => <span key={s} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-medium text-slate-300">{s}</span>)}
                      {p.skills?.length > 3 && <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-bold text-slate-500">+{p.skills.length - 3}</span>}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-5 border-t border-white/5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Max Budget</div>
                        <div className="text-lg font-black text-white leading-none">₹{p.budget?.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Duration</div>
                        <div className="text-sm font-bold text-slate-300 leading-none mt-1">{p.duration}</div>
                      </div>
                    </div>

                    <Link to={`/projects/${p._id}`} className="w-full btn-primary py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-glow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      View Details <ChevronRight size={14}/>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <button onClick={() => setPage(p => p - 1)} className="btn-secondary py-3 px-6 text-sm rounded-2xl border-white/10">← Prev</button>
            )}
            {[...Array(Math.min(Math.ceil(total / 12), 5))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                  page === i + 1 ? 'bg-primary text-white shadow-glow-primary' : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/5'
                }`}>
                {i + 1}
              </button>
            ))}
            {page < Math.ceil(total / 12) && (
              <button onClick={() => setPage(p => p + 1)} className="btn-secondary py-3 px-6 text-sm rounded-2xl border-white/10">Next →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
