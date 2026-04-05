import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Briefcase, Activity, CheckCircle, ChevronRight,
  AlertTriangle, XCircle, Clock, DollarSign, Users, Zap, TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusConfig = {
  open:        { label: 'Open',        cls: 'badge-blue' },
  bidding:     { label: 'Live Bid',    cls: 'badge-red' },
  in_progress: { label: 'In Progress', cls: 'badge-yellow' },
  completed:   { label: 'Completed',   cls: 'badge-green' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-gray' },
  draft:       { label: 'Draft',       cls: 'badge-gray' },
};

const healthBadge = (h) => {
  if (h === 'on_track') return <span className="badge-green flex items-center gap-1"><CheckCircle size={10}/> On Track</span>;
  if (h === 'at_risk')  return <span className="badge-yellow flex items-center gap-1"><AlertTriangle size={10}/> At Risk</span>;
  return <span className="badge-red flex items-center gap-1"><XCircle size={10}/> Delayed</span>;
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/projects/my/projects')
      .then(({ data }) => setProjects(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:      projects.length,
    bidding:    projects.filter(p => p.status === 'bidding').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed:  projects.filter(p => p.status === 'completed').length,
  };

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your projects and find the best talent</p>
        </div>
        <Link to="/projects/create" className="btn-primary">
          <Plus size={16}/> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: stats.total,      icon: Briefcase,  color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20' },
          { label: 'Live Auctions',  value: stats.bidding,    icon: Activity,   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'In Progress',    value: stats.inProgress, icon: Clock,      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Completed',      value: stats.completed,  icon: CheckCircle,color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={18} className={color}/>
            </div>
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-slate-500 text-sm mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Create Project',   desc: 'AI-powered setup',        to: '/projects/create',  Icon: Zap,          cls: 'btn-primary' },
          { label: 'Browse Freelancers', desc: 'Find vetted talent',    to: '/freelancers',      Icon: Users,        cls: 'btn-secondary' },
          { label: 'View Pricing',     desc: 'Manage subscription',      to: '/subscription',    Icon: DollarSign,   cls: 'btn-secondary' },
        ].map(({ label, desc, to, Icon, cls }, i) => (
          <Link key={i} to={to} className={`glass-card-hover p-4 flex items-center gap-3 group`}>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-white"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 text-sm group-hover:text-white transition-colors">{label}</div>
              <div className="text-slate-500 text-xs">{desc}</div>
            </div>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-primary transition-colors flex-shrink-0"/>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5">
            <Briefcase size={28} className="text-white"/>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">
            Create your first project and let AI help you write the description, suggest a budget, and find the best freelancer.
          </p>
          <Link to="/projects/create" className="btn-primary">
            <Plus size={16}/> Create Your First Project
          </Link>
        </motion.div>
      )}

      {/* Projects list */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">My Projects</h2>
            <Link to="/projects" className="text-primary text-sm hover:underline flex items-center gap-1">
              Browse All <ChevronRight size={13}/>
            </Link>
          </div>
          <div className="space-y-3">
            {projects.map((p, i) => {
              const sc = statusConfig[p.status] || statusConfig.draft;
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card-hover p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={sc.cls}>{sc.label}</span>
                        {p.status === 'in_progress' && healthBadge(p.healthStatus)}
                        {p.status === 'bidding' && (
                          <span className="badge-red flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot"/>LIVE
                          </span>
                        )}
                        {p.closedCommunity?.enabled && <span className="badge-purple text-xs">Private</span>}
                      </div>
                      <h3 className="font-semibold text-white text-base mb-1.5 truncate">{p.title}</h3>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Budget: <span className="text-slate-300 font-medium">₹{p.budget?.toLocaleString()}</span></span>
                        <span>Duration: <span className="text-slate-300 font-medium">{p.duration}</span></span>
                        <span>Phases: <span className="text-slate-300 font-medium">{p.phases?.length || 0}</span></span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      {p.status === 'bidding' && (
                        <Link to={`/projects/${p._id}/bid`} className="btn-primary py-2 px-3 text-xs">
                          <TrendingDown size={13}/> Live Bid
                        </Link>
                      )}
                      {p.status === 'in_progress' && (
                        <Link to={`/projects/${p._id}/phases`} className="btn-secondary py-2 px-3 text-xs">Phases</Link>
                      )}
                      <Link to={`/projects/${p._id}`} className="btn-secondary py-2 px-3 text-xs">Details</Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-5 h-20 shimmer"/>
          ))}
        </div>
      )}
    </div>
  );
}
