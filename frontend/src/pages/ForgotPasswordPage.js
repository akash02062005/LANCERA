import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
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
          
          <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>
          <p className="text-white/50 text-center text-sm mb-8">
            {submitted 
              ? "We've sent a recovery link to your email." 
              : "Enter your email to receive a password reset link."}
          </p>

          {!submitted ? (
            <form onSubmit={submit} className="space-y-6">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-white/40" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Email Address" 
                  required
                  className="input-field pl-9" 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <button 
                onClick={() => setSubmitted(false)} 
                className="text-primary hover:underline text-sm"
              >
                Didn't receive email? Try again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-white/50 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={14} className="mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
