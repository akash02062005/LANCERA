import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Upload, AlertTriangle, UserMinus } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'badge-gray', icon: Clock },
  in_progress: { label: 'In Progress', color: 'badge-blue', icon: Clock },
  submitted: { label: 'Submitted', color: 'badge-yellow', icon: Upload },
  approved: { label: 'Approved', color: 'badge-green', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'badge-red', icon: XCircle }
};

const healthConfig = {
  on_track: { label: 'On Track', color: 'badge-green', icon: CheckCircle },
  at_risk: { label: 'At Risk', color: 'badge-yellow', icon: AlertTriangle },
  delayed: { label: 'Delayed', color: 'badge-red', icon: XCircle }
};

export default function MilestonePage() {
  const { id } = useParams();
  const [phases, setPhases] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectFeedback, setRejectFeedback] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [showRemove, setShowRemove] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/phases/${id}`);
      setPhases(data.data.phases || []);
      setProject(data.data.project);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const action = async (phaseIndex, type, extra = {}) => {
    setActionLoading(l => ({ ...l, [`${phaseIndex}_${type}`]: true }));
    try {
      await api.post(`/phases/${id}/${phaseIndex}/${type}`, extra);
      toast.success(type === 'approve' ? 'Phase approved & payment released!' : type === 'reject' ? 'Phase rejected with feedback' : 'Phase submitted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${type}`);
    } finally {
      setActionLoading(l => ({ ...l, [`${phaseIndex}_${type}`]: false }));
    }
  };

  const removeFreelancer = async () => {
    try {
      await api.post(`/phases/${id}/remove-freelancer`, { reason: 'Unsatisfactory work' });
      toast.success('Freelancer removed. Project reopened for bidding.');
      setShowRemove(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove freelancer');
    }
  };

  const completed = phases.filter(p => p.status === 'approved').length;
  const health = project?.healthStatus || 'on_track';
  const HC = healthConfig[health] || healthConfig.on_track;

  if (loading) return <div className="flex justify-center items-center min-h-96"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{project?.title}</h1>
          <p className="text-white/50 text-sm mt-1">Phase-wise milestone tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={HC.color + ' flex items-center gap-1'}>
            <HC.icon size={14} /> {HC.label}
          </span>
          {user?.role === 'client' && project?.assignedFreelancerId && (
            <button onClick={() => setShowRemove(true)} className="btn-danger py-2 px-4 text-sm flex items-center gap-2">
              <UserMinus size={14} /> Remove Freelancer
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm font-medium">Overall Progress</span>
          <span className="font-bold">{completed}/{phases.length} phases</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${phases.length ? (completed / phases.length) * 100 : 0}%` }}
            className="h-full gradient-bg rounded-full transition-all duration-500" />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>₹{phases.filter(p => p.status === 'approved').reduce((s, p) => s + p.paymentAmount, 0).toLocaleString()} paid</span>
          <span>₹{phases.reduce((s, p) => s + p.paymentAmount, 0).toLocaleString()} total</span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase, i) => {
          const SC = statusConfig[phase.status] || statusConfig.pending;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${phase.status === 'approved' ? 'gradient-bg' : 'bg-white/10'}`}>
                    {phase.status === 'approved' ? '✓' : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-semibold">{phase.name}</h3>
                      <span className={SC.color + ' text-xs flex items-center gap-1'}><SC.icon size={10}/> {SC.label}</span>
                    </div>
                    {phase.description && <p className="text-white/50 text-sm mb-2">{phase.description}</p>}
                    {phase.rejectionFeedback && phase.status === 'rejected' && (
                      <div className="glass-card p-3 border-red-500/30 mb-2">
                        <p className="text-red-400 text-sm"><span className="font-medium">Feedback:</span> {phase.rejectionFeedback}</p>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-white/40">
                      {phase.deadline && <span>Deadline: {new Date(phase.deadline).toLocaleDateString()}</span>}
                      {phase.approvedAt && <span>Approved: {new Date(phase.approvedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold text-xl ${phase.status === 'approved' ? 'text-green-400' : 'text-white'}`}>
                    ₹{phase.paymentAmount?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {user?.role === 'freelancer' && phase.status === 'in_progress' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button onClick={() => action(i, 'submit')} disabled={actionLoading[`${i}_submit`]}
                    className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                    <Upload size={14} /> {actionLoading[`${i}_submit`] ? 'Submitting...' : 'Submit Phase for Review'}
                  </button>
                </div>
              )}

              {user?.role === 'freelancer' && phase.status === 'rejected' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button onClick={() => action(i, 'submit')} disabled={actionLoading[`${i}_submit`]}
                    className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                    <Upload size={14} /> Resubmit Phase
                  </button>
                </div>
              )}

              {user?.role === 'client' && phase.status === 'submitted' && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <button onClick={() => action(i, 'approve')} disabled={actionLoading[`${i}_approve`]}
                      className="btn-success text-sm flex items-center gap-2 flex-1 justify-center disabled:opacity-50">
                      <CheckCircle size={14} /> {actionLoading[`${i}_approve`] ? 'Approving...' : 'Approve & Release Payment'}
                    </button>
                    <button onClick={() => action(i, 'reject', { feedback: rejectFeedback[i] || 'Please revise the work.' })}
                      disabled={actionLoading[`${i}_reject`]}
                      className="btn-danger text-sm flex items-center gap-2 flex-1 justify-center disabled:opacity-50">
                      <XCircle size={14} /> {actionLoading[`${i}_reject`] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                  <input value={rejectFeedback[i] || ''} onChange={e => setRejectFeedback(r => ({ ...r, [i]: e.target.value }))}
                    placeholder="Rejection reason (required for reject)..." className="input-field text-sm" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Remove Freelancer Modal */}
      {showRemove && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Remove Freelancer?</h3>
            <p className="text-white/60 text-sm mb-6">This will remove the current freelancer from remaining phases. Approved phases and their payments are preserved. The project will be reopened for a new bid.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRemove(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={removeFreelancer} className="btn-danger flex-1">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
