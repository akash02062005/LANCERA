import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, CreditCard } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { id } = useParams();
  const [payments, setPayments] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.get(`/projects/${id}`), api.get('/payments/history')]).then(([proj, pay]) => {
      setProject(proj.data.data);
      const projectPayments = pay.data.data?.filter(p => p.projectId?._id === id || p.projectId === id) || [];
      setPayments(projectPayments);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (phaseIndex) => {
    try {
      // Ensure Razorpay script is loaded
      if (!window.Razorpay) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Failed to load Razorpay SDK. Check your internet connection.');
          return;
        }
      }

      const { data } = await api.post('/payments/order', { projectId: id, phaseIndex });
      if (!data.success || !data.data?.order) throw new Error('Order creation failed');
      
      const { order, key } = data.data;

      const options = {
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'Lancera',
        description: `Phase ${phaseIndex + 1} Payment`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              projectId: id, phaseIndex,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('Payment successful!');
            window.location.reload();
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: { color: '#6C63FF' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment Init Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to initiate payment');
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const totalBudget = project?.phases?.reduce((s, p) => s + p.paymentAmount, 0) || 0;

  if (loading) return <div className="flex justify-center items-center min-h-96"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Payments</h1>
      <p className="text-white/50 mb-8">{project?.title}</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 text-center">
          <DollarSign size={24} className="text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</div>
          <div className="text-white/40 text-sm">Total Paid</div>
        </div>
        <div className="glass-card p-5 text-center">
          <Clock size={24} className="text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">₹{(totalBudget - totalPaid).toLocaleString()}</div>
          <div className="text-white/40 text-sm">Remaining</div>
        </div>
        <div className="glass-card p-5 text-center">
          <CreditCard size={24} className="text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</div>
          <div className="text-white/40 text-sm">Total Budget</div>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">Payment Progress</span>
          <span className="font-bold">{totalBudget ? Math.round((totalPaid / totalBudget) * 100) : 0}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${totalBudget ? (totalPaid / totalBudget) * 100 : 0}%` }}
            className="h-full gradient-bg rounded-full" />
        </div>
      </div>

      {/* Phase Payments */}
      <div className="glass-card p-5 mb-6">
        <h3 className="font-semibold mb-4">Phase Payments</h3>
        <div className="space-y-3">
          {project?.phases?.map((phase, i) => {
            const paid = payments.find(p => p.phaseIndex === i && p.status === 'completed');
            const isApproved = phase.status === 'approved';
            return (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isApproved ? 'gradient-bg' : 'bg-white/10'}`}>
                    {isApproved ? <CheckCircle size={16} className="text-white" /> : <span className="text-sm font-bold">{i + 1}</span>}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{phase.name}</div>
                    <div className="text-white/40 text-xs">{phase.status?.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold">₹{phase.paymentAmount?.toLocaleString()}</div>
                  {paid ? (
                    <span className="badge-green text-xs">Paid</span>
                  ) : isApproved && user?.role === 'client' ? (
                    <button onClick={() => initiatePayment(i)} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                      <CreditCard size={12} /> Pay Now
                    </button>
                  ) : (
                    <span className="badge-gray text-xs">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Transaction History</h3>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm">
                <div>
                  <div className="font-medium">Phase {p.phaseIndex + 1} Payment</div>
                  <div className="text-white/40 text-xs">{new Date(p.date).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">₹{p.amount?.toLocaleString()}</div>
                  <span className={p.status === 'completed' ? 'badge-green text-xs' : 'badge-yellow text-xs'}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
