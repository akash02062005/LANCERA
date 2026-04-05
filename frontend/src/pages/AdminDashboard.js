import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, DollarSign, Activity, Shield, 
  Trash2, UserPlus, Filter, Search, MoreVertical,
  CheckCircle, AlertCircle, TrendingUp, BarChart3,
  Layers, Lock, Globe, Zap, ArrowUpRight
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, pRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/projects')
      ]);
      setStats(sRes.data.data);
      setUsers(uRes.data.data);
      setProjects(pRes.data.data);
    } catch (err) {
      toast.error('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success(`Role updated to ${role}`);
      fetchData();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User removed');
      fetchData();
    } catch {
      toast.error('Deletion failed');
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Strike this project from the platform?')) return;
    try {
      await api.delete(`/admin/projects/${projectId}`);
      toast.success('Project purged');
      fetchData();
    } catch {
      toast.error('Action failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030B18] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030B18] pt-24 pb-20 px-6 sm:px-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-glow-sm">
                <Shield size={22} />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Command Center</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
              Platform <span className="text-primary italic">Oversight</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Intercept users or missions..."
                  className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full lg:w-80 shadow-premium"
                />
             </div>
             <button onClick={fetchData} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Activity size={20} />
             </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-10 p-1.5 bg-white/5 border border-white/10 rounded-[2rem] w-fit shadow-xl">
           {[
             { id: 'overview', label: 'Intelligence', icon: BarChart3 },
             { id: 'users', label: 'Entities', icon: Users },
             { id: 'projects', label: 'Missions', icon: Layers }
           ].map(tab => (
             <button 
               key={tab.id} onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                 activeTab === tab.id ? 'bg-primary text-white shadow-glow-primary' : 'text-slate-500 hover:text-white'
               }`}
             >
               <tab.icon size={16} /> {tab.label}
             </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Entities', value: stats.totalUsers, icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10' },
                   { label: 'Active Missions', value: stats.totalProjects, icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                   { label: 'Network Handshakes', value: stats.totalBids, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                   { label: 'Platform Volume', value: `₹${stats.totalVolume?.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
                 ].map((stat, i) => (
                   <div key={i} className="glass-card-dark p-8 border-white/5 relative group overflow-hidden">
                      <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}>
                         <stat.icon size={120} />
                      </div>
                      <div className="flex items-center gap-4 mb-6">
                         <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border border-current/10`}>
                            <stat.icon size={20} />
                         </div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</span>
                      </div>
                      <div className="text-3xl font-black text-white tracking-tight mb-2">{stat.value}</div>
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                         <ArrowUpRight size={12} /> 12.5% Growth
                      </div>
                   </div>
                 ))}
              </div>

              {/* Large Chart Placeholder / Secondary Board */}
              <div className="glass-card-ultra p-10 border-white/10 relative overflow-hidden h-96 flex flex-col justify-center items-center">
                 <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] -z-10" />
                 <BarChart3 size={48} className="text-slate-700 mb-6" />
                 <h3 className="text-xl font-bold text-slate-500 uppercase tracking-[0.2em]">Regional Traffic Monitor</h3>
                 <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest font-black">AI Analytics Undergoing Synchronization</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass-card-ultra border-white/10 overflow-hidden shadow-premium">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Role</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Verified</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Plan</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                 {u.name[0]}
                               </div>
                               <div>
                                 <div className="text-sm font-bold text-white">{u.name}</div>
                                 <div className="text-[10px] text-slate-500 font-medium lowercase">{u.email}</div>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <select 
                               value={u.role} onChange={(e) => updateUserRole(u._id, e.target.value)}
                               className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase text-white tracking-widest focus:outline-none focus:border-primary/50"
                             >
                                <option value="client">Client</option>
                                <option value="freelancer">Freelancer</option>
                                <option value="admin">Admin</option>
                             </select>
                          </td>
                          <td className="px-8 py-6">
                             {u.isVerified ? (
                               <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                  <CheckCircle size={12} /> SECURED
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-red-500/50 text-[10px] font-black uppercase tracking-widest">
                                  <AlertCircle size={12} /> UNVERIFIED
                               </div>
                             )}
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-tighter border border-sky-500/20">
                               {u.subscriptionPlan}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button onClick={() => deleteUser(u._id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-600 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20">
                                   <Trash2 size={16} />
                                </button>
                                <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all">
                                   <MoreVertical size={16} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(p => (
                    <div key={p._id} className="glass-card-dark p-8 border-white/5 relative group">
                       <div className="flex justify-between items-start mb-6">
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                            p.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                          }`}>
                            {p.status}
                          </div>
                          <button onClick={() => deleteProject(p._id)} className="p-2.5 rounded-xl bg-white/5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                             <Trash2 size={16} />
                          </button>
                       </div>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3 line-clamp-1">{p.title}</h3>
                       <div className="flex flex-wrap gap-2 mb-6">
                          {p.skills?.slice(0, 3).map(s => <span key={s} className="text-[9px] font-black uppercase text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">{s}</span>)}
                       </div>
                       <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div>
                             <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Budget Volume</div>
                             <div className="text-base font-black text-white leading-none">₹{p.budget?.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Contractor</div>
                             <div className="text-[10px] font-bold text-primary leading-none uppercase">{p.clientId?.name || 'Anonymous'}</div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
