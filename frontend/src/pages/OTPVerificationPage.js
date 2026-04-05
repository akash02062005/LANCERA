import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);
  const [resending, setResending] = useState(false);
  const refs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    const timer = setInterval(() => setResendTimer(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp([...pasted.split(''), ...Array(6 - pasted.length).fill('')]);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) return toast.error('Please enter all 6 digits');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpStr });
      toast.success('Email verified! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New OTP sent to your email');
      setResendTimer(300);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-hero">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
              <Mail size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">Verify Email</h1>
          <p className="text-white/50 text-center text-sm mb-2">Enter the 6-digit OTP sent to</p>
          <p className="text-primary text-center font-medium mb-8 text-sm">{email}</p>

          <form onSubmit={submit}>
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => refs.current[i] = el}
                  value={digit} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1} type="text" inputMode="numeric"
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border-2 border-white/20 focus:border-primary focus:outline-none transition-colors text-white" />
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="text-center mt-6">
            {resendTimer > 0 ? (
              <p className="text-white/40 text-sm">Resend OTP in <span className="text-primary font-medium">{fmt(resendTimer)}</span></p>
            ) : (
              <button onClick={resendOTP} disabled={resending}
                className="text-primary hover:underline text-sm flex items-center gap-1 mx-auto">
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} /> Resend OTP
              </button>
            )}
          </div>

          <p className="text-center text-white/40 text-sm mt-4">
            <Link to="/signup" className="hover:text-white transition-colors">← Back to Signup</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
