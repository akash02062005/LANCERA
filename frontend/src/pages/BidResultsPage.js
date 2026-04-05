import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Star, Users, TrendingDown, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function BidResultsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [session, setSession] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.get(`/projects/${id}`), api.get(`/bidding/session/${id}`)]).then(([p, s]) => {
      setProject(p.data.data);
      setSession(s.data.data?.session);
      setBids(s.data.data?.bids || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-96"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const winnerBid = bids.find(b => b.status === 'won');
  const winner = winnerBid?.freelancerId;
  const totalBids = bids.length;

  return (
    <div className="page-container max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold">Auction Completed</h1>
          <p className="text-white/50">{project?.title}</p>
        </div>

        {/* Winner Card */}
        {winner && (
          <div className="glass-card p-6 mb-6 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Trophy size={24} className="text-yellow-400" />
              <h3 className="font-bold text-xl">Winner</h3>
              {winnerBid?.recommendationScore > 50 && (
                <span className="badge-yellow flex items-center gap-1"><Star size={12}/> AI Recommended</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-2xl font-bold">
                {winner.name?.[0]}
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold">{winner.name}</div>
                <div className="text-white/50 text-sm">AI Quiz Score: {winnerBid.aiQuizScore}/100</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-green-400">₹{winnerBid.bidAmount?.toLocaleString()}</div>
                <div className="text-white/40 text-sm">Winning Bid</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <Users size={20} className="text-blue-400 mx-auto mb-1" />
            <div className="font-bold text-xl">{totalBids}</div>
            <div className="text-white/40 text-xs">Total Bids</div>
          </div>
          <div className="glass-card p-4 text-center">
            <TrendingDown size={20} className="text-green-400 mx-auto mb-1" />
            <div className="font-bold text-xl text-green-400">₹{winnerBid?.bidAmount?.toLocaleString()}</div>
            <div className="text-white/40 text-xs">Final Price</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-xl font-bold text-yellow-400 mb-1">
              {project?.budget && winnerBid?.bidAmount ? Math.round(((project.budget - winnerBid.bidAmount) / project.budget) * 100) : 0}%
            </div>
            <div className="text-white/40 text-xs">Savings</div>
          </div>
        </div>

        {/* All Bids */}
        <div className="glass-card p-5 mb-6">
          <h3 className="font-semibold mb-4">All Bids</h3>
          <div className="space-y-2">
            {bids.map((bid, i) => (
              <div key={bid._id} className={`flex items-center justify-between p-3 rounded-lg ${bid.status === 'won' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-white/40 text-sm w-5">{i + 1}</span>
                  <div>
                    <div className="font-medium text-sm">{bid.freelancerId?.name}</div>
                    <div className="text-white/40 text-xs">Quiz: {bid.aiQuizScore}/100</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bid.status === 'won' && <span className="badge-yellow text-xs"><Trophy size={10}/></span>}
                  <div className="font-bold text-lg">₹{bid.bidAmount?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={`/projects/${id}`} className="btn-secondary flex-1 text-center">View Project</Link>
          {user?.role === 'client' && (
            <Link to={`/projects/${id}/phases`} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Manage Phases <ChevronRight size={16}/>
            </Link>
          )}
          {user?.role === 'freelancer' && winner?._id === user?._id && (
            <Link to={`/projects/${id}/messages`} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Start Working <ChevronRight size={16}/>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
