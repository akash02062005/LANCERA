import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, Zap, Star, Clock, Users, Brain, LogOut, Play, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ReactConfetti from 'react-confetti';

function fmtTime(ms) {
  if (!ms || ms <= 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function LiveBiddingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [project, setProject]         = useState(null);
  const [session, setSession]         = useState(null);
  const [bids, setBids]               = useState([]);
  const [bidAmount, setBidAmount]     = useState('');
  const [timeLeft, setTimeLeft]       = useState(null);
  const [placing, setPlacing]         = useState(false);
  const [winner, setWinner]           = useState(null);
  const [isWinner, setIsWinner]       = useState(false);
  const [showResult, setShowResult]   = useState(false);
  const [concluding, setConcluding]   = useState(false);
  const [concludingSecsLeft, setConcludingSecsLeft] = useState(10);
  const [hasCompletedQuiz, setHasCompletedQuiz]     = useState(true);
  const [quizReport, setQuizReport]   = useState([]);
  const [startingBid, setStartingBid] = useState(false);
  const concludingTimerRef = useRef(null);

  const isFreelancer = user?.role === 'freelancer';
  const isClient     = user?.role === 'client';

  // ── Fetch initial data ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [projRes, sessRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/bidding/session/${id}`)
      ]);
      setProject(projRes.data.data);
      setSession(sessRes.data.data?.session);
      setBids(sessRes.data.data?.bids || []);

      if (user?.role === 'freelancer') {
        if (!sessRes.data.data?.hasCompletedQuiz) {
          toast.error('Please complete the AI quiz first');
          navigate(`/projects/${id}/quiz`);
        } else {
          setHasCompletedQuiz(true);
        }
      }
    } catch {
      toast.error('Failed to load bidding data');
    }
  }, [id, user, navigate]);

  // ── Fetch quiz report for client ────────────────────────────────────────────
  const fetchQuizReport = useCallback(async () => {
    if (user?.role !== 'client') return;
    try {
      const { data } = await api.get(`/bidding/quiz-report/${id}`);
      setQuizReport(data.data || []);
    } catch {}
  }, [id, user]);

  useEffect(() => {
    fetchData();
    fetchQuizReport();
  }, [fetchData, fetchQuizReport]);

  // ── Inactivity countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.lastBidAt || session?.status !== 'active') return;
    const iv = setInterval(() => {
      const diff = 60000 - (new Date() - new Date(session.lastBidAt));
      setTimeLeft(Math.max(0, diff));
    }, 500);
    return () => clearInterval(iv);
  }, [session?.lastBidAt, session?.status]);

  // ── Concluding 10s live countdown ───────────────────────────────────────────
  useEffect(() => {
    if (!concluding) {
      setConcludingSecsLeft(10);
      if (concludingTimerRef.current) clearInterval(concludingTimerRef.current);
      return;
    }
    setConcludingSecsLeft(10);
    concludingTimerRef.current = setInterval(() => {
      setConcludingSecsLeft(s => {
        if (s <= 1) { clearInterval(concludingTimerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(concludingTimerRef.current);
  }, [concluding]);

  // ── Socket events ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.emit('join_project', { projectId: id });

    const onBidUpdate = ({ bid }) => {
      setBids(prev => {
        const filtered = prev.filter(b => b.freelancerId?._id !== bid.freelancerId?._id);
        return [bid, ...filtered].sort((a, b) => a.bidAmount - b.bidAmount);
      });
      setSession(prev => ({
        ...prev,
        currentLowestBid: bid.bidAmount,
        currentLowestBidderId: bid.freelancerId,
        lastBidAt: new Date().toISOString(),
        concludingStartTime: null
      }));
      setConcluding(false);
    };

    const onBidStarted = () => {
      toast.success('🔴 Bidding is now live!');
      fetchData();
    };

    const onBidEnded = ({ winner: w, reason }) => {
      setWinner(w);
      setConcluding(false);
      setIsWinner(w?._id === user?._id || w?._id?.toString() === (user?._id || user?.id)?.toString());
      setShowResult(true);
      if (reason === 'all_quit') toast('All participants quit — winner announced', { icon: '🏁' });
      setTimeout(() => navigate(`/projects/${id}/results`), 4000);
    };

    const onConcluding = () => {
      setConcluding(true);
    };

    const onFreelancerQuit = ({ freelancerId }) => {
      setSession(prev => ({
        ...prev,
        joinedFreelancers: prev?.joinedFreelancers?.map(f =>
          (f.freelancerId?._id === freelancerId || f.freelancerId === freelancerId)
            ? { ...f, isQuit: true } : f
        )
      }));
    };

    const onQuizScoreUpdate = ({ scores }) => {
      setQuizReport(scores);
    };

    socket.on('bid_update', onBidUpdate);
    socket.on('bid_started', onBidStarted);
    socket.on('bid_ended', onBidEnded);
    socket.on('bidding_concluding', onConcluding);
    socket.on('freelancer_quit_update', onFreelancerQuit);
    socket.on('quiz_score_update', onQuizScoreUpdate);

    return () => {
      socket.off('bid_update', onBidUpdate);
      socket.off('bid_started', onBidStarted);
      socket.off('bid_ended', onBidEnded);
      socket.off('bidding_concluding', onConcluding);
      socket.off('freelancer_quit_update', onFreelancerQuit);
      socket.off('quiz_score_update', onQuizScoreUpdate);
    };
  }, [socket, id, user, navigate, fetchData]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const placeBid = async () => {
    const amt = Number(bidAmount);
    if (!amt || amt < project?.minBid)
      return toast.error(`Minimum bid is ₹${project?.minBid?.toLocaleString()}`);
    if (session?.currentLowestBid && amt >= session.currentLowestBid)
      return toast.error('Your bid must be lower than the current lowest bid');
    setPlacing(true);
    try {
      const { data } = await api.post(`/bidding/bid/${id}`, { bidAmount: amt });
      socket?.emit('bid_placed', { projectId: id, bid: data.data });
      toast.success('✅ Bid placed!');
      setBids(prev => {
        const filtered = prev.filter(b => b.freelancerId?._id !== (user?._id || user?.id));
        return [data.data, ...filtered].sort((a, b) => a.bidAmount - b.bidAmount);
      });
      setSession(prev => ({ ...prev, currentLowestBid: amt, lastBidAt: new Date(), concludingStartTime: null }));
      setConcluding(false);
      setBidAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    } finally { setPlacing(false); }
  };

  const quitBidding = async () => {
    if (!window.confirm('Are you sure you want to quit this bidding session?')) return;
    try {
      await api.post(`/bidding/quit/${id}`);
      toast.success('You have quit the bidding');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to quit bidding');
    }
  };

  const handleStartBidding = async () => {
    setStartingBid(true);
    try {
      await api.post(`/bidding/start/${id}`);
      toast.success('🚀 Bidding started!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start bidding');
    } finally { setStartingBid(false); }
  };

  const selectWinner = async (bid) => {
    if (!window.confirm('Select this freelancer as winner?')) return;
    try {
      await api.post(`/bidding/winner/${id}`, { winnerId: bid.freelancerId?._id, bidId: bid._id });
      toast.success('🏆 Winner selected!');
      fetchData();
    } catch { toast.error('Failed to select winner'); }
  };

  const recommended   = bids.length ? bids.reduce((best, b) => (b.recommendationScore || 0) > (best.recommendationScore || 0) ? b : best, bids[0]) : null;
  const currentLowest = session?.currentLowestBid || project?.budget;
  const biddingActive = session?.status === 'active';
  const biddingLobby  = session?.status === 'lobby' || session?.status === 'waiting';

  if (!project || !hasCompletedQuiz) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen gradient-hero">
      {showResult && isWinner && <ReactConfetti recycle={false} numberOfPieces={500} gravity={0.15}/>}

      {/* ── Win/Lose Result Modal ─── */}
      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="glass-card p-10 text-center max-w-sm w-full">
              <div className="text-6xl mb-4">{isWinner ? '🏆' : '😔'}</div>
              {isWinner ? (
                <>
                  <h2 className="text-3xl font-black gradient-text mb-2">You Won!</h2>
                  <p className="text-slate-400 text-sm mb-6">Congratulations! You've secured the project.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-white mb-2">Bid Closed</h2>
                  <p className="text-slate-400 text-sm mb-6">Another freelancer was selected. Keep bidding!</p>
                </>
              )}
              {winner && (
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 mb-5">
                  <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold">
                    {winner.name?.[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white text-sm">{winner.name}</div>
                    <div className="text-slate-500 text-xs">Winner</div>
                  </div>
                </div>
              )}
              <p className="text-slate-500 text-xs">Redirecting to results...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Final 10s Countdown Modal ─── */}
      <AnimatePresence>
        {concluding && biddingActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-10 text-center max-w-sm w-full border-red-500/50">
              <div className={`text-7xl font-black mb-4 transition-all ${concludingSecsLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                {concludingSecsLeft}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Final Countdown!</h2>
              <p className="text-slate-400 text-sm mb-6">
                No bids for 1 minute. Bidding closes in <strong className="text-white">{concludingSecsLeft}s</strong> unless someone bids now!
              </p>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                  className="bg-red-500 h-full rounded-full"
                />
              </div>
              {isFreelancer && (
                <p className="text-slate-500 text-xs mt-4">Place a bid now to keep the auction going!</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">{project.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {biddingActive ? (
                <span className="badge-red flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot"/>LIVE AUCTION
                </span>
              ) : (
                <span className="badge-yellow flex items-center gap-1.5">
                  <Clock size={10}/> STARTS SOON
                </span>
              )}
              <span className="text-slate-500 text-xs">Min bid: ₹{project.minBid?.toLocaleString()}</span>
            </div>
          </div>

          {/* Inactivity Timer — only shown during active bidding */}
          {biddingActive && (
            <div className={`text-center px-5 py-2.5 rounded-2xl border-2 transition-all ${timeLeft < 15000 ? 'border-red-500/60 bg-red-500/10' : 'border-border glass-card'}`}>
              <div className={`text-4xl font-black font-mono ${timeLeft < 15000 ? 'timer-danger' : 'text-white'}`}>
                {fmtTime(timeLeft)}
              </div>
              <div className="text-slate-500 text-xs flex items-center gap-1 justify-center mt-0.5">
                <Clock size={10}/> inactivity timeout
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left panel ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Current lowest */}
            <div className="glass-card p-5 text-center">
              <p className="text-slate-500 text-xs mb-1 uppercase tracking-wide">Current Lowest Bid</p>
              <motion.div key={currentLowest} initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                className="text-4xl font-black text-emerald-400">
                ₹{currentLowest?.toLocaleString()}
              </motion.div>
              <p className="text-slate-600 text-xs mt-1">{bids.length} bids placed</p>
            </div>

            {/* Freelancer: bid input (only when active) */}
            {isFreelancer && biddingActive && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingDown size={15} className="text-primary"/> Place Your Bid
                </h3>
                <div className="relative mb-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    placeholder={`Max: ${(currentLowest || 0) - 1}`}
                    className="input-field pl-7 text-lg font-bold"
                  />
                </div>
                <button
                  onClick={placeBid}
                  disabled={placing}
                  className="btn-primary w-full disabled:opacity-50 mb-3"
                >
                  {placing ? 'Placing...' : <><Zap size={15}/> Place Bid</>}
                </button>
                <button
                  onClick={quitBidding}
                  className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={14}/> Quit Bidding
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { val: bids.length, label: 'Total Bids', color: 'text-white' },
                  { val: session?.joinedFreelancers?.length || 0, label: 'Bidders', color: 'text-white' },
                  { val: `₹${project.minBid?.toLocaleString()}`, label: 'Min Bid', color: 'text-amber-400' },
                  { val: `₹${project.budget?.toLocaleString()}`, label: 'Max Budget', color: 'text-emerald-400' },
                ].map(({ val, label, color }, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-xl p-2.5">
                    <div className={`font-bold text-lg ${color}`}>{val}</div>
                    <div className="text-slate-500 text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client: manual winner select (active only) */}
            {isClient && biddingActive && bids.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="font-semibold text-white text-sm mb-3">Select Winner Manually</h3>
                <button onClick={() => selectWinner(bids[0])} className="btn-primary w-full text-sm">
                  <Star size={14}/> Select Top Bidder
                </button>
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Client: Quiz Report (shown in lobby + active) */}
            {isClient && quizReport.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain size={15} className="text-primary"/> AI Quiz Report
                  <span className="ml-auto text-slate-500 text-xs font-normal">{quizReport.length} completed</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {quizReport.map((f, i) => (
                    <div key={f.freelancerId || i}
                      className={`flex items-center justify-between p-3 rounded-xl border ${i === 0 ? 'bg-primary/8 border-primary/30' : 'bg-white/[0.03] border-border/20'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {f.name?.[0] || '?'}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-200">{f.name}</span>
                          {i === 0 && <span className="ml-2 badge-indigo text-xs">Top Score</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${f.score >= 80 ? 'text-emerald-400' : f.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                          {f.score}/100
                        </div>
                        <div className="text-slate-600 text-xs">{f.correct}/{f.total} correct</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Bid Board */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users size={15}/> Live Bid Board
                <span className="ml-auto text-slate-500 text-xs font-normal">{bids.length} bids</span>
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {bids.map((bid, i) => {
                    const isTopBid      = i === 0;
                    const isRecommended = bid === recommended && isClient;
                    const isMyBid       = bid.freelancerId?._id === (user?._id || user?.id);
                    return (
                      <motion.div
                        key={bid._id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isTopBid ? 'bg-emerald-500/8 border-emerald-500/25' :
                          isMyBid  ? 'bg-primary/8 border-primary/20' :
                          'bg-white/[0.03] border-border/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold">
                              {bid.freelancerId?.name?.[0] || '?'}
                            </div>
                            {isTopBid && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-dark"/>}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-slate-200">{bid.freelancerId?.name || 'Freelancer'}</span>
                              {isTopBid && <span className="badge-green text-xs">Lowest</span>}
                              {isRecommended && <span className="badge-yellow text-xs flex items-center gap-1"><Star size={9}/> AI Pick</span>}
                              {isMyBid && <span className="badge-indigo text-xs">You</span>}
                            </div>
                            <div className="text-slate-500 text-xs">Quiz: {bid.aiQuizScore || 0}/100 · Score: {bid.recommendationScore || 0}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500 text-xs font-bold mb-1 uppercase">Rank #{i + 1}</div>
                          <div className={`font-black text-xl ${isTopBid ? 'text-emerald-400' : 'text-slate-200'}`}>
                            ₹{bid.bidAmount?.toLocaleString()}
                          </div>
                          <div className="text-slate-600 text-xs">{new Date(bid.timestamp || Date.now()).toLocaleTimeString()}</div>
                          {isClient && isTopBid && biddingActive && (
                            <button onClick={() => selectWinner(bid)} className="text-xs text-primary hover:underline mt-0.5">
                              Select Winner
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {bids.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <TrendingDown size={36} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm">
                      {biddingActive ? 'No bids yet. Be the first to bid!' : 'Bidding hasn\'t started yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Participants (lobby view) */}
            {biddingLobby && session?.joinedFreelancers?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Users size={15}/> Participants
                  <span className="text-slate-500 font-normal text-xs ml-auto">{session.joinedFreelancers.length} joined</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {session.joinedFreelancers.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5">
                      <div className="w-5 h-5 rounded gradient-bg flex items-center justify-center text-xs font-bold">
                        {f.freelancerId?.name?.[0] || '?'}
                      </div>
                      <span className="text-slate-300 text-xs">{f.freelancerId?.name || 'Freelancer'}</span>
                      {f.hasCompletedQuiz && <CheckCircle size={11} className="text-emerald-400"/>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
