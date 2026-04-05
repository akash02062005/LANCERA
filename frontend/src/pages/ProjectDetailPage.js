import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Lock, DollarSign, Zap, ChevronRight, Copy, Check, Calendar, Shield, BarChart2, ArrowLeft, Info, Star, Send } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusConfig = {
  open:        { label: 'Open',        cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  bidding:     { label: 'Live Bidding',cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  completed:   { label: 'Completed',   cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  draft:       { label: 'Draft',       cls: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isClient    = user?.role === 'client';
  const isFreelancer= user?.role === 'freelancer';

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchProjectData = () => {
      Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/bidding/session/${id}`).catch(() => ({ data: { data: {} } }))
      ]).then(([projRes, sessRes]) => {
        setProject(projRes.data.data);
        setSession(sessRes.data.data?.session);
      }).catch(() => {
        toast.error('Project not found');
        navigate('/projects');
      }).finally(() => setLoading(false));
    };
    fetchProjectData();
  }, [id, navigate]);

  useEffect(() => {
    if (!project || project.status !== 'open') return;

    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(project.bidStartTime);
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        // Optionally refresh project status or just let the user know it's live
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ d, h, m, s });
    }, 1000);

    return () => clearInterval(timer);
  }, [project]);

  const joinBid = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!isFreelancer) return toast.error('Only freelancers can join bids');
    setJoining(true);
    try {
      if (project.closedCommunity?.enabled) {
        if (!inviteCode.trim()) return toast.error('Enter the invite code first');
        await api.post(`/projects/${id}/join-request`, { inviteCode: inviteCode.trim() });
        toast.success('Join request sent! Waiting for client approval.');
      } else {
        await api.post(`/bidding/join/${id}`);
        toast.success('Joined! Take the AI quiz to proceed.');
        navigate(`/projects/${id}/quiz`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(project?.closedCommunity?.inviteCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invite code copied!');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#030B18]">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
  if (!project) return null;

  const isOwner    = user?._id === project.clientId?._id;
  const isJoined   = session?.joinedFreelancers?.some(f => (f.freelancerId?._id || f.freelancerId)?.toString() === user?._id?.toString());
  const slots      = session?.joinedFreelancers?.length || 0;
  const isFull     = slots >= (project.freelancerLimit || 20);
  const isBidding  = project.status === 'bidding';
  const sc         = statusConfig[project.status] || statusConfig.draft;

  return (
    <div className="min-h-screen bg-[#030B18] pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link to="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest mb-8 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Discover
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card-dark p-8 border-white/5 relative overflow-hidden">
               {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />

              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/5 uppercase ${sc.cls}`}>
                  {sc.label}
                </span>
                {project.closedCommunity?.enabled && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black tracking-widest border border-purple-500/20 uppercase flex items-center gap-1">
                    <Lock size={10}/> Private Circle
                  </span>
                )}
                {project.aiGenerated && (
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-widest border border-indigo-500/20 uppercase flex items-center gap-1">
                    <Zap size={10}/> AI-Enhanced
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{project.title}</h1>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                    {project.clientId?.name?.[0]}
                  </div>
                  <span className="text-sm font-bold text-slate-300">{project.clientId?.name}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={14} className="text-primary" /> Project Description
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>

                {project.skills?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Required Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map(s => (
                        <span key={s} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-300">
                            {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Phases / Roadmap */}
            {project.phases?.length > 0 && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-dark p-8 border-white/5">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <BarChart2 size={22} className="text-primary" /> Project Roadmap
                </h3>
                
                <div className="relative space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary to-transparent opacity-20" />

                  {project.phases.map((phase, i) => (
                    <div key={i} className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-dark-1 border border-white/10 flex items-center justify-center z-10 shadow-premium group cursor-default">
                        <span className="text-xs font-black text-primary">{i + 1}</span>
                      </div>
                      <div className="glass-card p-5 border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-base">{phase.name}</h4>
                          <span className="text-emerald-400 font-bold text-sm">₹{phase.paymentAmount?.toLocaleString()}</span>
                        </div>
                        {phase.description && <p className="text-slate-500 text-xs mb-3">{phase.description}</p>}
                        {phase.deadline && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <Calendar size={10} /> Deadline: {new Date(phase.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6 sticky top-24">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card-ultra p-6 border-white/10 shadow-premium">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Auction Intelligence</h3>
              
              {/* Live Countdown Timer */}
              {project.status === 'open' && timeLeft && (
                <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-glow-sm">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={12} className="animate-pulse" /> Bidding Starts In
                  </div>
                  <div className="flex gap-2">
                    {[
                      { l: 'D', v: timeLeft.d },
                      { l: 'H', v: timeLeft.h },
                      { l: 'M', v: timeLeft.m },
                      { l: 'S', v: timeLeft.s }
                    ].map((unit, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-xl py-2 px-1 text-center border border-white/5">
                        <div className="text-lg font-black text-white leading-none">{unit.v < 10 ? `0${unit.v}` : unit.v}</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{unit.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <DollarSign size={18} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Max Budget</div>
                  </div>
                  <div className="text-xl font-black text-white leading-none">₹{project.budget?.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Timeframe</div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        <Clock size={14} className="text-sky-400" /> {project.duration}
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Availability</div>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        <Users size={14} className="text-purple-400" /> {slots}/{project.freelancerLimit}
                      </div>
                   </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="space-y-3">
                {isFreelancer && ['open', 'bidding'].includes(project.status) && (
                  <>
                    {project.closedCommunity?.enabled ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                           <p className="text-slate-400 text-xs leading-relaxed flex items-center gap-2">
                             <Lock size={14} className="text-purple-400 flex-shrink-0"/>
                             This is a private project. Enter the invite code to request access.
                           </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <input
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value)}
                            placeholder="Enter Invite Code"
                            className="input-field bg-white/5 border-white/10 text-sm font-mono tracking-widest py-3 text-center"
                          />
                          <button onClick={joinBid} disabled={joining} className="btn-primary w-full py-3.5 shadow-glow-primary">
                            {joining ? 'Requesting Access...' : 'Request Join'}
                          </button>
                        </div>
                      </div>
                    ) : isFull && !isJoined ? (
                      <div className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                        <Users size={18} /> Auction Full
                      </div>
                    ) : (
                       <Link to={isJoined || isBidding || (new Date(project.bidStartTime) <= new Date()) ? `/projects/${id}/lobby` : '#'} 
                         className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-primary transition-all ${
                            isJoined || isBidding || (new Date(project.bidStartTime) <= new Date()) 
                              ? 'btn-primary' 
                              : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-50'
                         }`}
                         onClick={(e) => {
                            if (!isJoined && !isBidding && !(new Date(project.bidStartTime) <= new Date())) {
                              e.preventDefault();
                              joinBid();
                            }
                         }}
                       >
                         {isJoined ? (
                           <>Enter Bidding Room <ChevronRight size={18}/></>
                         ) : isBidding ? (
                           <>
                             <span className="w-2 h-2 rounded-full bg-red-400 live-dot"/>
                             Enter Live Auction <ChevronRight size={18}/>
                           </>
                         ) : (new Date(project.bidStartTime) <= new Date()) ? (
                           <>Enter Bidding Lobby <ChevronRight size={18}/></>
                         ) : (
                           <>Join Auction & Take Quiz <ChevronRight size={18}/></>
                         )}
                       </Link>
                    )}
                    <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold hover:text-white transition-all">
                       Save to Favorites
                    </button>

                    {/* Peer-to-Peer Messaging Button */}
                    {!isOwner && isAuthenticated && (
                      <Link 
                        to={`/messages/direct/${project.clientId?._id}`}
                        className="w-full py-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"
                      >
                         <Send size={16} /> Message Client
                      </Link>
                    )}
                  </>
                )}

                {isOwner && (
                  <div className="space-y-3">
                    {isBidding && (
                      <Link to={`/projects/${id}/bid`} className="w-full btn-primary py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-glow-sm flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 live-dot"/> View Live Bidding
                      </Link>
                    )}
                    
                    {project.status === 'in_progress' ? (
                       <div className="grid grid-cols-1 gap-2">
                          <Link to={`/projects/${id}/phases`} className="w-full btn-primary py-3 px-4 rounded-xl text-xs font-bold justify-center">Manage Phases</Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Link to={`/projects/${id}/messages`} className="btn-secondary py-2.5 rounded-xl text-xs font-bold justify-center">Messages</Link>
                            <Link to={`/projects/${id}/payment`} className="btn-secondary py-2.5 rounded-xl text-xs font-bold justify-center">Payments</Link>
                          </div>
                       </div>
                    ) : project.status === 'open' ? (
                      <Link to={`/community/${id}`} className="w-full btn-secondary py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Shield size={16} className="text-purple-400"/> Manage Circle
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Auction Timer Box */}
            {isBidding && (
              <div className="glass-card-dark p-6 border-red-500/20 bg-red-500/[0.02]">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Auction Ending Soon</span>
                </div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
                  REAL-TIME BIDDING ACTIVE
                </div>
                <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Bids are updated instantly via secure websocket</p>
              </div>
            )}

            {/* Bidding Guidelines */}
            <div className="p-6 glass-card-dark border-white/5">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Star size={14} className="text-amber-400" /> Hiring Strategy
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                This project uses <span className="text-white font-bold italic">Reverse Auction Bidding</span>. The winner is selected based on the lowest bid amount and highest AI-verified score.
              </p>
              <ul className="space-y-2">
                {[
                  "Pass AI Technical Quiz to enter",
                  "Bid amount must be below current floor",
                  "Winning bid is frozen for client review",
                  "AI Score used for tie-breaking"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-500 text-[10px] font-medium leading-tight italic">
                    <Check size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
             {/* Invite Code for Owner */}
             {isOwner && project.closedCommunity?.enabled && (
              <div className="glass-card-ultra p-6 border-purple-500/20 bg-purple-500/[0.02]">
                <div className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Shield size={14} /> Private Invite Hub
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                  <span className="font-mono font-bold text-white tracking-widest">{project.closedCommunity.inviteCode}</span>
                  <button onClick={copyInviteCode} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-500" />}
                  </button>
                </div>
                <p className="text-slate-500 text-[10px] leading-relaxed font-bold italic uppercase tracking-wider">Share this code with trusted freelancers only.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
