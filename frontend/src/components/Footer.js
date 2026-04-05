import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const LanceraLogo = () => (
  <svg width="28" height="28" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/>
        <stop offset="0.5" stopColor="#A855F7"/>
        <stop offset="1" stopColor="#22D3EE"/>
      </linearGradient>
    </defs>
    <rect width="34" height="34" rx="10" fill="url(#footerLogoGrad)"/>
    <path d="M9 25V9h3.5v13h9V25H9z" fill="white" opacity="0.95"/>
    <path d="M22 9l4.5 4.5-4.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <circle cx="26" cy="23" r="2.5" fill="white" opacity="0.9"/>
  </svg>
);

const Footer = () => (
  <footer className="border-t border-border/40 mt-24" style={{ background: 'linear-gradient(180deg, #030B18 0%, #050D1E 100%)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

        {/* Brand */}
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group">
            <LanceraLogo />
            <span className="text-xl font-black text-white">Lance<span className="gradient-text">ra</span></span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
            The world's first AI-powered reverse auction freelancer marketplace. Bid smarter, hire better.
          </p>
          <div className="flex gap-2">
            {[
              { Icon: Github, href: '#' },
              { Icon: Twitter, href: '#' },
              { Icon: Linkedin, href: '#' },
              { Icon: Mail, href: '/contact' },
            ].map(({ Icon, href }, i) => (
              <Link key={i} to={href}
                className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all">
                <Icon size={14} />
              </Link>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="font-semibold text-slate-200 mb-4 text-sm">Platform</h4>
          <div className="space-y-2.5">
            {[
              ['Home', '/'],
              ['Features', '/features'],
              ['Browse Projects', '/projects'],
              ['Pricing', '/subscription'],
            ].map(([label, to]) => (
              <Link key={to} to={to} className="block text-slate-500 text-sm hover:text-slate-300 transition-colors">{label}</Link>
            ))}
          </div>
        </div>

        {/* For Users */}
        <div>
          <h4 className="font-semibold text-slate-200 mb-4 text-sm">For You</h4>
          <div className="space-y-2.5">
            {[
              ['Join as Freelancer', '/signup'],
              ['Post a Project', '/signup'],
              ['AI Features', '/features'],
              ['Community', '/features'],
            ].map(([label, to]) => (
              <Link key={label} to={to} className="block text-slate-500 text-sm hover:text-slate-300 transition-colors">{label}</Link>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold text-slate-200 mb-4 text-sm">Support</h4>
          <div className="space-y-2.5">
            {[
              ['Contact Us', '/contact'],
              ['FAQ', '/contact'],
              ['Login', '/login'],
              ['Sign Up', '/signup'],
            ].map(([label, to]) => (
              <Link key={label} to={to} className="block text-slate-500 text-sm hover:text-slate-300 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Neon divider */}
      <div className="neon-line mb-6" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-600 text-xs">
          © 2025 Lancera by <span className="text-slate-500">Green Sync Innovators</span>. All rights reserved.
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </span>
          <span className="text-border">·</span>
          <span>Hack Wise 2.0 · Table 07</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
