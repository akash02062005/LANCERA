import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Briefcase, Code, Eye, EyeOff, ArrowRight, CheckCircle, Sparkles, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const LanceraLogo = () => (
  <svg width="40" height="40" viewBox="0 0 34 34" fill="none">
    <defs>
      <linearGradient id="signupLogoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/><stop offset="0.5" stopColor="#A855F7"/><stop offset="1" stopColor="#22D3EE"/>
      </linearGradient>
    </defs>
    <rect width="34" height="34" rx="10" fill="url(#signupLogoGrad)"/>
    <path d="M9 25V9h3.5v13h9V25H9z" fill="white" opacity="0.95"/>
    <path d="M22 9l4.5 4.5-4.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <circle cx="26" cy="23" r="2.5" fill="white" opacity="0.9"/>
  </svg>
);

export default function SignupPage() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'freelancer' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/signup', { name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Check your email for the OTP.');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
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

        <div className="relative z-10 max-w-lg text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <LanceraLogo />
              <span className="text-2xl font-black tracking-tighter text-white">LANCERA</span>
            </div>
            <h1 className="text-6xl font-black leading-[1.1] mb-6">
              Empowering <span className="gradient-text">Top Talent</span> with AI.
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed mb-10">
              The only platform where AI selects the best bids through reverse auctions and live skill verification.
            </p>

            <div className="space-y-6">
              {[
                { icon: Code, title: "For Freelancers", text: "Win high-value projects through fair auctions and AI-verified skills." },
                { icon: Briefcase, title: "For Clients", text: "Hire the best talent automatically with AI budget and quality assurance." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5"
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary h-fit">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-1">{item.title}</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto max-h-screen py-16">
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
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
              <p className="text-slate-500 text-sm">Join the AI-powered freelance revolution.</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: 'freelancer', icon: Code, label: 'Freelancer', desc: 'Find work' },
                { value: 'client', icon: Briefcase, label: 'Client', desc: 'Hire talent' },
              ].map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, role: value }))}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-200 relative overflow-hidden group ${
                    form.role === value
                      ? 'border-primary bg-primary/10'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  {form.role === value && (
                    <motion.div layoutId="roleGlow" className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
                  )}
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <Icon size={18} className={form.role === value ? 'text-primary' : 'text-slate-500'}/>
                    {form.role === value && <CheckCircle size={14} className="text-primary"/>}
                  </div>
                  <div className={`font-bold text-sm leading-none relative z-10 ${form.role === value ? 'text-white' : 'text-slate-400'}`}>{label}</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-600 mt-1 relative z-10">{desc}</div>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <div className="relative group">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"/>
                  <input
                    name="name" value={form.name} onChange={handle}
                    placeholder="Full name" required autoComplete="name"
                    className="input-field pl-11 bg-white/5 border-white/10 hover:border-white/20 focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"/>
                  <input
                    name="email" type="email" value={form.email} onChange={handle}
                    placeholder="Email address" required autoComplete="email"
                    className="input-field pl-11 bg-white/5 border-white/10 hover:border-white/20 focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"/>
                  <input
                    name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handle}
                    placeholder="Password" required autoComplete="new-password"
                    className="input-field pl-11 bg-white/5 border-white/10"
                  />
                </div>
                <div className="relative group">
                  <input
                    name="confirmPassword" type={showPass ? 'text' : 'password'}
                    value={form.confirmPassword} onChange={handle}
                    placeholder="Confirm" required autoComplete="new-password"
                    className="input-field pl-4 bg-white/5 border-white/10"
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full py-3.5 text-base mt-2 shadow-glow-primary group"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Creating account...
                  </span>
                ) : (
                  <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
                )}
              </button>
            </form>

            <p className="text-center text-slate-600 text-[11px] mt-6 leading-relaxed px-4">
              By signing up, you agree to our <span className="text-slate-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-slate-400 hover:underline cursor-pointer">Privacy Policy</span>.
            </p>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-semibold hover:text-primary transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
