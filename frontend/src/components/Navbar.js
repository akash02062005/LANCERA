import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Briefcase, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LanceraLogo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/>
        <stop offset="0.5" stopColor="#A855F7"/>
        <stop offset="1" stopColor="#22D3EE"/>
      </linearGradient>
    </defs>
    <rect width="34" height="34" rx="10" fill="url(#logoGrad)"/>
    <path d="M9 25V9h3.5v13h9V25H9z" fill="white" opacity="0.95"/>
    <path d="M22 9l4.5 4.5-4.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <circle cx="26" cy="23" r="2.5" fill="white" opacity="0.9"/>
  </svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navLinks = [
    { to: '/', label: 'Home', exact: true },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
    { to: '/features', label: 'Features' },
    {
      to: user?.role === 'client' ? '/freelancers' : '/projects',
      label: user?.role === 'client' ? 'Freelancers' : 'Projects',
      icon: user?.role === 'client' ? Users : Briefcase
    },
    { to: '/contact', label: 'Contact' },
  ];

  const linkClass = (path, exact = false) => {
    const active = exact ? location.pathname === path : location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return `relative text-sm font-medium transition-all duration-200 py-1 ${active ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark/90 backdrop-blur-xl border-b border-border/40 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LanceraLogo />
            </motion.div>
            <span className="text-xl font-black tracking-tight text-white">
              Lance<span className="gradient-text">ra</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`${linkClass(link.to, link.to === '/')} px-3 py-2 rounded-lg hover:bg-white/5`}>
                {link.label}
                {isActive(link.to) && link.to === location.pathname && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/subscription"
                  className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  Plans
                </Link>
                <div className="w-px h-5 bg-border/60" />
                <div className="flex items-center gap-2 pl-2">
                  <Link to="/profile" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm font-bold text-white shadow-glow-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                    </div>
                  </Link>
                  <button onClick={handleLogout}
                    className="ml-1 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Logout">
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-dark/95 backdrop-blur-xl border-t border-border/40"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === link.to ? 'bg-primary/15 text-white border border-primary/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-border/40 space-y-2 mt-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm">
                      <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                      </div>
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/subscription" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                      Plans & Pricing
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10">
                      <LogOut size={15} /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1 btn-secondary text-center py-2.5 text-sm">Sign In</Link>
                    <Link to="/signup" className="flex-1 btn-primary text-center py-2.5 text-sm">Get Started</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
