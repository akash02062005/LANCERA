import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Copy, Check, UserCheck, UserX, Users } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ClosedCommunityPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [proj, reqs] = await Promise.all([
        api.get(`/projects/${id}`),
        user?.role === 'client' ? api.get(`/projects/${id}/join-requests`) : Promise.resolve({ data: { data: [] } })
      ]);
      setProject(proj.data.data);
      setRequests(reqs.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRequest = async (freelancerId, action) => {
    try {
      await api.put(`/projects/${id}/join-request/${freelancerId}`, { action });
      toast.success(`Request ${action}ed`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(project?.closedCommunity?.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center items-center min-h-96"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const pending = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');
  const rejected = requests.filter(r => r.status === 'rejected');

  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
          <Lock size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Closed Community</h1>
          <p className="text-white/50 text-sm">{project?.title}</p>
        </div>
      </div>

      {user?.role === 'client' && (
        <>
          {/* Invite Code */}
          <div className="glass-card p-6 mb-6">
            <h3 className="font-semibold mb-4">Your Private Invite Code</h3>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div>
                <div className="font-mono font-black text-3xl tracking-widest text-primary">
                  {project?.closedCommunity?.inviteCode}
                </div>
                <div className="text-white/40 text-xs mt-1">Share this code privately with trusted freelancers</div>
              </div>
              <button onClick={copyCode} className="btn-secondary py-2 px-4 ml-auto flex items-center gap-2 text-sm">
                {copied ? <><Check size={14} className="text-green-400" /> Copied!</> : <><Copy size={14} /> Copy Code</>}
              </button>
            </div>
            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-white/70">Share via: WhatsApp, Email, Slack, or any communication channel. Only people with this exact code can request to join.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{pending.length}</div>
              <div className="text-white/40 text-xs">Pending</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{accepted.length}</div>
              <div className="text-white/40 text-xs">Accepted</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-white">{project?.freelancerLimit}</div>
              <div className="text-white/40 text-xs">Max Limit</div>
            </div>
          </div>

          {/* Pending Requests */}
          {pending.length > 0 && (
            <div className="glass-card p-5 mb-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Users size={16}/> Pending Requests ({pending.length})</h3>
              <div className="space-y-3">
                {pending.map((req, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center font-bold">
                        {req.freelancerId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-medium">{req.freelancerId?.name}</div>
                        <div className="text-white/40 text-xs flex gap-2">
                          <span>AI Score: {req.freelancerId?.aiScore || 0}</span>
                          <span>·</span>
                          <span>{req.freelancerId?.skills?.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRequest(req.freelancerId?._id, 'accept')}
                        className="btn-success py-1.5 px-3 text-xs flex items-center gap-1">
                        <UserCheck size={12}/> Accept
                      </button>
                      <button onClick={() => handleRequest(req.freelancerId?._id, 'reject')}
                        className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1">
                        <UserX size={12}/> Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted */}
          {accepted.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-400"><UserCheck size={16}/> Accepted Freelancers ({accepted.length})</h3>
              <div className="space-y-2">
                {accepted.map((req, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold">
                      {req.freelancerId?.name?.[0] || '?'}
                    </div>
                    <div className="font-medium">{req.freelancerId?.name}</div>
                    <span className="badge-green text-xs ml-auto">Accepted</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Lock size={32} className="text-white/30 mx-auto mb-3" />
              <p className="text-white/50">No join requests yet. Share your invite code to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
