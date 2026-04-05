import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-hero">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
              <Zap size={28} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">New Password</h1>
          
          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={48} className="text-primary" />
              </div>
              <p className="text-white/80 mb-6">Your password has been changed successfully. Redirecting you to login...</p>
              <Link to="/login" className="btn-primary inline-block w-full">Login Now</Link>
            </motion.div>
          ) : (
            <>
              <p className="text-white/50 text-center text-sm mb-8">Create a new secure password for your account</p>
              <form onSubmit={submit} className="space-y-4">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-white/40" />
                  <input 
                    id="password" 
                    type={showPass ? 'text' : 'password'} 
                    value={form.password} 
                    onChange={handle} 
                    placeholder="New Password" 
                    required 
                    className="input-field pl-9 pr-10" 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-white/40">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-white/40" />
                  <input 
                    id="confirm" 
                    type="password" 
                    value={form.confirm} 
                    onChange={handle} 
                    placeholder="Confirm New Password" 
                    required 
                    className="input-field pl-9" 
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-6">
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
