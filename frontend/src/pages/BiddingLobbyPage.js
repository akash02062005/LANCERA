import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckCircle, AlertCircle, Zap, Clock, Brain, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function fmt(ms) {
  if (!ms || ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
}

export default function BiddingLobbyPage() {
  const { id } = useParams();
  const [lobbyData, setLobbyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchLobby = useCallback(async () => {
    try {
      const { data } = await api.get(`/bidding/lobby/${id}`);
      setLobbyData(data.data);
      // If bidding already active, go straight to bid page
      if (data.data?.project?.status === 'bidding') {
        navigate(`/projects/${id}/bid`, { replace: true });
      }
    } catch (err) {
      toast.error('Failed to load lobby');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchLobby(); }, [fetchLobby]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.emit('join_lobby', { projectId: id });

    const onBidStarted = ({ projectId }) => {
      if (projectId === id) {
        toast.success('🔴 Bidding is now live!');
        navigate(`/projects/${id}/bid`);
      }
    };
    const onQuizDone = () => fetchLobby();

    socket.on('bid_started', onBidStarted);
    socket.on('freelancer_quiz_done', onQuizDone);

    return () => {
      socket.off('bid_started', onBidStarted);
      socket.off('freelancer_quiz_done', onQuizDone);
    };
  }, [socket, id, navigate, fetchLobby]);

  // Countdown timer to bid start
  useEffect(() => {
    if (!lobbyData?.project?.bidStartTime) return;
    const tick = () => {
      const diff = new Date(lobbyData.project.bidStartTime) - new Date();
      if (diff <= 0) {
        setTimeLeft(0);
        // Redirect when countdown hits zero
        navigate(`/projects/${id}/bid`);
      } else {
        setTimeLeft(diff);
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [lobbyData?.project?.bidStartTime, id, navigate]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { project, session, hasCompletedQuiz, quizScore } = lobbyData || {};
  const joined = session?.joinedFreelancers?.length || 0;
  const isLobbyLive = timeLeft !== null && timeLeft <= 0;

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-4"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <span className="badge-indigo mb-3 inline-flex items-center gap-1.5">
            <Zap size={11}/> Bidding Lobby
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{project?.title}</h1>
          <p className="text-slate-400 text-sm">Bidding starts in:</p>
        </div>

        {/* Countdown */}
        <div className="glass-card p-8 text-center">
          {isLobbyLive ? (
            <div className="space-y-3">
              <div className="text-5xl font-black text-red-400 flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 live-dot"/>LIVE
              </div>
              <p className="text-slate-400 text-sm">Bidding is active — entering now...</p>
            </div>
          ) : (
            <>
              <div className="text-5xl sm:text-6xl font-black font-mono gradient-text-blue mb-2 tracking-wider">
                {fmt(timeLeft)}
              </div>
              <p className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
                <Clock size={12}/> {project?.bidDuration}-minute auction · Min bid ₹{project?.minBid?.toLocaleString()}
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: `₹${project?.budget?.toLocaleString()}`, label: 'Max Budget', color: 'text-emerald-400' },
            { val: `${joined}/${project?.freelancerLimit}`, label: 'Slots Filled', color: 'text-sky-400' },
            { val: `${project?.bidDuration}m`,             label: 'Bid Duration', color: 'text-violet-400' },
          ].map(({ val, label, color }, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <div className={`text-xl font-bold ${color}`}>{val}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Quiz status (freelancer only) */}
        {user?.role === 'freelancer' && (
          <div className={`glass-card p-4 flex items-center gap-3 ${hasCompletedQuiz ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
            {hasCompletedQuiz ? (
              <>
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0"/>
                <div>
                  <div className="text-emerald-400 font-semibold text-sm">Quiz completed! You're ready to bid.</div>
                  <div className="text-slate-500 text-xs">Your score: {quizScore}/100</div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={20} className="text-amber-400 flex-shrink-0"/>
                <div className="flex-1">
                  <div className="text-amber-400 font-semibold text-sm">AI Quiz not completed yet</div>
                  <div className="text-slate-500 text-xs">You must complete the quiz before bidding</div>
                </div>
                <Link to={`/projects/${id}/quiz`} className="btn-primary text-xs py-2 px-3 flex-shrink-0">
                  Take Quiz <ArrowRight size={12}/>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Freelancers list */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-primary"/>
            <h3 className="font-semibold text-white">In Lobby <span className="text-slate-500 font-normal">({joined})</span></h3>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {session?.joinedFreelancers?.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.03] rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold">
                    {f.freelancerId?.name?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium text-slate-200">{f.freelancerId?.name || 'Freelancer'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {f.hasCompletedQuiz ? (
                    <span className="badge-green text-xs flex items-center gap-1"><CheckCircle size={9}/> Quiz Done</span>
                  ) : (
                    <span className="badge-yellow text-xs flex items-center gap-1"><Brain size={9}/> Pending Quiz</span>
                  )}
                </div>
              </div>
            ))}
            {joined === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">No freelancers joined yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Enter button when live */}
        {isLobbyLive && (
          <button 
            onClick={() => {
              if (hasCompletedQuiz) {
                navigate(`/projects/${id}/bid`);
              } else {
                toast.error('Please complete the AI quiz first');
                navigate(`/projects/${id}/quiz`);
              }
            }}
            className="btn-primary w-full text-center py-4 text-base justify-center flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 live-dot"/>
            Enter Live Bidding Now
          </button>
        )}
      </motion.div>
    </div>
  );
}
