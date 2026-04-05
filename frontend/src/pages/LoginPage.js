import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LanceraLogo = () => (
  <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
    <defs>
      <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/><stop offset="0.5" stopColor="#A855F7"/><stop offset="1" stopColor="#22D3EE"/>
      </linearGradient>
    </defs>
    <rect width="34" height="34" rx="10" fill="url(#loginLogoGrad)"/>
    <path d="M9 25V9h3.5v13h9V25H9z" fill="white" opacity="0.95"/>
    <path d="M22 9l4.5 4.5-4.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <circle cx="26" cy="23" r="2.5" fill="white" opacity="0.9"/>
  </svg>
);

export default function LoginPage() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030B18] overflow-hidden">
      {/* Visual Side (Left) - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-dark-1">
        <div className="absolute inset-0 mesh-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[140px] animate-glow-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <LanceraLogo />
              <span className="text-2xl font-black tracking-tighter text-white">LANCERA</span>
            </div>
            <h1 className="text-6xl font-black text-white leading-[1.1] mb-6">
              The Future of <span className="gradient-text">Work</span> is Here.
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed mb-10">
              Join the most advanced AI-powered marketplace for top-tier freelancers and clients.
            </p>

            <div className="space-y-4">
              {[
                { icon: Zap, text: "Live Reverse Auction Bidding", color: "text-amber-400" },
                { icon: Sparkles, text: "AI-Powered Project Management", color: "text-primary" },
                { icon: Shield, text: "Milestone-based Secure Payments", color: "text-emerald-400" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-3 text-slate-300"
                >
                  <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Decorative background for mobile */}
        <div className="absolute inset-0 lg:hidden mesh-bg opacity-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <LanceraLogo />
          </div>

          <div className="glass-card-dark p-8 sm:p-10 border-white/[0.08] shadow-premium">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Please enter your credentials to continue.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"/>
                  <input
                    name="email" type="email" value={form.email} onChange={handle}
                    placeholder="name@company.com" required autoComplete="email"
                    className="input-field pl-11 bg-white/5 border-white/10 hover:border-white/20 focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-xs text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"/>
                  <input
                    name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handle}
                    placeholder="••••••••" required autoComplete="current-password"
                    className="input-field pl-11 pr-12 bg-white/5 border-white/10 hover:border-white/20 focus:bg-white/[0.08]"
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full py-3.5 text-base mt-4 shadow-glow-primary group"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-white font-semibold hover:text-primary transition-colors">
                  Create one for free
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
