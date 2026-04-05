import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star, Shield, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PLANS = [
  {
    key: 'starter',
    name: 'Explorer',
    price: 0,
    desc: 'For casual freelancers starting their journey.',
    features: ['3 Active Bids/mo', 'Standard AI Quiz', 'Community Access', 'Basic Messaging'],
    color: 'text-slate-400',
    btn: 'Current Plan',
    premium: false
  },
  {
    key: 'pro',
    name: 'Professional',
    price: 999,
    desc: 'The best value for serious power users.',
    features: ['Unlimited Active Bids', 'Full AI Suite', 'Early Project Access', 'Priority Support', 'Verified Expert Badge'],
    color: 'text-primary',
    btn: 'Upgrade to Pro',
    premium: true,
    popular: true
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    desc: 'For agencies and large scale clients.',
    features: ['Dedicated Account Manager', 'Custom NDA Integration', 'Private Community Hubs', 'API Access', 'White-label Reports'],
    color: 'text-indigo-400',
    btn: 'Contact Sales',
    premium: false
  }
];

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    setCurrentPlan(user?.subscriptionPlan || 'starter');
  }, [user]);

  const handleSubscribe = async (planKey) => {
    if (planKey === currentPlan) return;
    setLoading(true);
    try {
      // Simulate/Trigger API call
      await api.post('/subscriptions/subscribe', { plan: planKey });
      toast.success(`Welcome to the ${planKey} tier! ✨`);
      setCurrentPlan(planKey);
      if (updateUser) updateUser({ ...user, subscriptionPlan: planKey });
    } catch (err) {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030B18] pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Crown size={12} /> Membership Tiers
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Scale Your <span className="text-gradient">Empire</span></h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">Flat monthly fee. Zero commission on projects. Keep 100% of your earnings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((p, i) => (
            <motion.div 
              key={p.key} 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[32px] border transition-all duration-500 group flex flex-col ${
                p.popular 
                  ? 'bg-primary/[0.03] border-primary/40 shadow-glow-primary scale-105 z-10' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-glow-sm">
                  Most Popular
                </div>
              )}

              {currentPlan === p.key && (
                <div className="absolute -top-4 right-8 px-3 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest">
                  Active
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-black mb-2 ${p.color}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">₹{p.price.toLocaleString()}</span>
                  <span className="text-slate-600 font-bold text-sm">/month</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>

              <div className="flex-1 space-y-4 mb-10 text-slate-300">
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`mt-0.5 p-1 rounded-lg ${p.popular ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-600'}`}>
                      <Check size={12} />
                    </div>
                    <span className="text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe(p.key)}
                disabled={loading || currentPlan === p.key}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  currentPlan === p.key 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                    : p.popular 
                      ? 'bg-primary text-white shadow-glow-primary hover:scale-[1.02]' 
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {loading ? 'Processing...' : currentPlan === p.key ? 'Current Base' : p.btn}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 glass-card-dark p-10 border-white/5 text-center max-w-4xl mx-auto relative group">
           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] -z-10" />
           <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Shield size={24} />
              <span className="font-black text-xs uppercase tracking-widest">Enterprise Shield</span>
           </div>
           <h3 className="text-2xl font-black text-white mb-4">Why Flat Subscription instead of Commission?</h3>
           <p className="text-slate-500 mb-8 max-w-xl mx-auto text-sm leading-relaxed font-medium">Standard platforms take 10-20% of your revenue. Lancera takes ₹0. You keep every rupee you earn. For high-performers, this saves lakhs annually.</p>
           <button className="inline-flex items-center gap-2 btn-secondary px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:border-primary/50 transition-all">
              Consult with Growth Team <ArrowRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}
