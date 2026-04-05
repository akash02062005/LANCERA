import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingDown, Brain, Shield, Activity, Star, CreditCard,
  Users, CheckCircle, Zap, ArrowRight, BarChart3, Sparkles
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const innovations = [
  { icon: TrendingDown, title: 'Reverse Auction', desc: 'Freelancers bid DOWN — not up. You always get the most competitive price without compromising on quality.', color: '#6366F1', glow: 'rgba(99,102,241,0.15)' },
  { icon: Brain, title: 'AI Quiz Vetting', desc: '5 targeted questions, 7 seconds each — generated from your actual project description. Only the qualified get in.', color: '#A855F7', glow: 'rgba(168,85,247,0.15)' },
  { icon: Shield, title: 'Closed Community', desc: 'Private bidding rooms with invite codes. Your trusted inner circle, your rules. Zero public exposure.', color: '#22D3EE', glow: 'rgba(34,211,238,0.15)' },
  { icon: BarChart3, title: 'Smart Bid Feedback', desc: 'HIGH / FAIR / LOW status with winning probability % before you commit. Bid with confidence, not guesses.', color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
  { icon: Star, title: 'AI Best Match', desc: 'Weighted AI scoring: bid (40%) + quiz (35%) + profile (25%). The recommended freelancer is highlighted instantly.', color: '#6366F1', glow: 'rgba(99,102,241,0.15)' },
  { icon: Activity, title: 'Project Health', desc: 'Green / Yellow / Red live health indicators. AI monitors deadlines, submissions, and communication gaps.', color: '#10B981', glow: 'rgba(16,185,129,0.15)' },
  { icon: CreditCard, title: 'Phase Payments', desc: 'Pay per milestone, not up front. Approve each phase individually. Remove and replace if needed.', color: '#22D3EE', glow: 'rgba(34,211,238,0.15)' },
  { icon: Sparkles, title: 'AI Project Creation', desc: 'Type a title. AI writes your description, suggests budget, identifies required skills, and breaks it into phases.', color: '#A855F7', glow: 'rgba(168,85,247,0.15)' },
  { icon: Users, title: 'SaaS Pricing', desc: 'Flat monthly subscription — no 10-20% commission per project. Predictable, transparent, fair.', color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
];

const steps = [
  { num: '01', icon: '📋', title: 'Client Posts Project', desc: 'AI writes the description, suggests the budget range, identifies required skills, and breaks the project into milestones.', color: '#6366F1' },
  { num: '02', icon: '🏆', title: 'Freelancers Compete', desc: 'Bids go DOWN in a live reverse auction. Each bidder first passes an AI-generated quiz tailored to your project.', color: '#A855F7' },
  { num: '03', icon: '🤖', title: 'AI Picks the Best', desc: 'The AI recommends the ideal candidate based on bid competitiveness, quiz score, and profile match.', color: '#22D3EE' },
  { num: '04', icon: '💰', title: 'Work & Get Paid', desc: 'Phase-by-phase delivery with client approval at each milestone. Payment releases instantly on approval.', color: '#10B981' },
];

const comparisons = [
  ['Bidding Model', 'Freelancers bid UP ↑', 'Reverse auction — bid DOWN ↓'],
  ['Vetting', 'Generic tests or none', 'AI quiz per project'],
  ['Budget Help', 'Client guesses', 'AI suggests range'],
  ['Revenue Model', '10–20% commission', 'Flat SaaS subscription'],
  ['Trust & Privacy', 'Public bidding', 'Closed Community circles'],
  ['Bid Intelligence', 'None', 'HIGH/FAIR/LOW + win %'],
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Startup Founder', avatar: 'PS', text: 'Found an amazing React developer in under 2 minutes. The reverse auction saved me ₹12,000 vs what I expected to pay!', stars: 5 },
  { name: 'Rahul Kumar', role: 'Freelance Developer', avatar: 'RK', text: 'The Smart Bid Feedback showed me my winning chances before I committed. Won 3 projects this month alone!', stars: 5 },
  { name: 'TechCorp Solutions', role: 'Enterprise Client', avatar: 'TC', text: 'The Closed Community feature is a game-changer. Private auctions with our vetted developer pool only.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="gradient-hero mesh-bg overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full opacity-[0.06] blur-3xl" style={{ background: '#6366F1' }} />
        <div className="absolute top-40 right-1/4 w-56 h-56 rounded-full opacity-[0.06] blur-3xl" style={{ background: '#A855F7' }} />

        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10">
          {/* Pill badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-7">
            <Zap size={13} />
            AI-Powered Reverse Auction Marketplace
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.08] tracking-tight text-white">
            Hire Smarter.<br />
            <span className="gradient-text">Bid Faster.</span><br />
            Build Better.
          </motion.h1>

          {/* Sub */}
          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's first AI-powered reverse auction freelancer marketplace. Freelancers compete by bidding <span className="text-white font-semibold">down</span>. AI vets every candidate. Phase-wise payments ensure quality.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link to="/signup" className="btn-primary text-base px-7 py-3.5 group">
              Start for Free
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/features" className="btn-secondary text-base px-7 py-3.5">
              See How It Works
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {[['500+', 'Projects Posted'], ['1,000+', 'Verified Freelancers'], ['₹50L+', 'Total Paid Out'], ['4.9★', 'Average Rating']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black gradient-text-blue">{val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Live auction preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative mt-16 max-w-2xl mx-auto"
        >
          <div className="glass-card p-5 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-red flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-dot" />
                    LIVE AUCTION
                  </span>
                  <span className="text-slate-500 text-xs">React E-commerce Platform</span>
                </div>
                <div className="text-2xl font-black text-emerald-400">₹38,500 <span className="text-slate-500 text-sm font-normal">current lowest</span></div>
              </div>
              <div className="text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                <div className="text-2xl font-black text-red-400 font-mono">1:47</div>
                <div className="text-xs text-slate-500">remaining</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Arjun M.', bid: '₹38,500', score: 94, tag: 'Lowest', tagClass: 'badge-green' },
                { name: 'Sneha R.', bid: '₹41,200', score: 88, tag: 'AI Pick', tagClass: 'badge-yellow' },
                { name: 'Vikram P.', bid: '₹44,000', score: 72, tag: '', tagClass: '' },
              ].map((b, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${i === 0 ? 'bg-emerald-500/8 border border-emerald-500/20' : 'bg-white/3'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold">{b.name[0]}</div>
                    <span className="text-sm font-medium text-slate-200">{b.name}</span>
                    {b.tag && <span className={`${b.tagClass} text-xs`}>{b.tag}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Quiz {b.score}/100</span>
                    <span className={`font-bold text-sm ${i === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>{b.bid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 blur-2xl opacity-30" style={{ background: 'linear-gradient(90deg, #6366F1, #22D3EE)' }} />
        </motion.div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-4">
            Simple Process
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            How <span className="gradient-text">Lancera</span> Works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">From project post to final payment in 4 streamlined steps</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card-hover p-6 group cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{step.icon}</span>
                <span className="text-xs font-bold text-slate-600 font-mono">{step.num}</span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2 leading-snug">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              <div className="mt-4 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500" style={{ background: step.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 9 Innovations ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-widest bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full mb-4">
            Innovations
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            9 Features No Other<br /><span className="gradient-text">Platform Has</span>
          </h2>
          <p className="text-slate-400 text-lg">We didn't iterate on existing platforms — we rethought the model entirely.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {innovations.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="glass-card group cursor-default p-6 transition-all duration-300 hover:border-white/15"
              style={{ '--glow': item.glow }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: item.glow, border: `1px solid ${item.color}33` }}>
                <item.icon size={22} style={{ color: item.color }} />
              </div>
              <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ───────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">
            Why Not <span className="text-slate-500 line-through decoration-red-500/60">Upwork</span>?
          </h2>
          <p className="text-slate-400">See exactly what sets Lancera apart from legacy platforms.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-card-light/80 px-5 py-3.5 border-b border-border/40">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Feature</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Upwork / Fiverr</div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider text-center">Lancera</div>
          </div>
          {comparisons.map(([feature, old, neww], i) => (
            <div key={i} className={`grid grid-cols-3 px-5 py-4 border-b border-border/20 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
              <div className="text-slate-300 text-sm font-medium pr-4">{feature}</div>
              <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">✕</span>
                <span className="hidden sm:inline">{old}</span>
              </div>
              <div className="text-center text-emerald-400 text-sm flex items-center justify-center gap-1.5">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span className="hidden sm:inline">{neww}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-4xl font-black text-white mb-3">
            Loved by <span className="gradient-text">Builders</span>
          </h2>
          <p className="text-slate-400">Real results from real users on the Lancera platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3 border-t border-border/30 pt-4">
                <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 50%, rgba(34,211,238,0.08) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          {/* Decorative glows */}
          <div className="absolute top-0 left-1/4 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: '#6366F1' }} />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full blur-3xl opacity-15" style={{ background: '#22D3EE' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/25 px-4 py-1.5 rounded-full mb-6">
              <Zap size={12} /> Free to get started
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Ready to <span className="gradient-text">Revolutionize</span><br />Your Hiring?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of clients and freelancers on the smarter, fairer, faster platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup" className="btn-primary text-base px-8 py-3.5 group">
                Get Started Free
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/projects" className="btn-secondary text-base px-8 py-3.5">
                Browse Projects
              </Link>
            </div>
            <p className="text-slate-600 text-xs mt-5">No credit card required · Cancel anytime · Free Starter plan forever</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
