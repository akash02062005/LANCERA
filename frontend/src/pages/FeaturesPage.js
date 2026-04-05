import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Brain, Shield, Activity, Star, Zap, CreditCard, Users, BarChart } from 'lucide-react';

const features = [
  {
    icon: TrendingDown, color: '#6C63FF', title: 'Reverse Auction Bidding',
    desc: 'Unlike traditional platforms where freelancers bid UP (propose prices), Lancera runs a LIVE reverse auction where freelancers compete by bidding DOWN. Clients always get the most competitive price.',
    bullets: ['Starting price = client\'s max budget', 'Each new bid must be lower than current', 'Winner = lowest bid when timer hits zero', 'Tie broken by AI quiz score']
  },
  {
    icon: Brain, color: '#FF6584', title: 'AI Brainstorm Quiz',
    desc: 'Before any freelancer can enter the live auction, they must pass an AI-generated technical quiz based on the ACTUAL project description. 5 questions, 7 seconds each.',
    bullets: ['Questions generated from project context', '7-second timer per question (strict)', 'Score contributes to recommendation ranking', 'Cumulative score tracked on profile']
  },
  {
    icon: Shield, color: '#4BB543', title: 'Closed Community Circle',
    desc: 'Clients can create private bidding rooms accessible only to trusted freelancers. A unique invite code is generated and shared privately.',
    bullets: ['Unique invite code per project', 'Client reviews and accepts/rejects requests', 'Perfect for enterprise clients', 'Prevents spam from unqualified bids']
  },
  {
    icon: Activity, color: '#FFA500', title: 'Smart Bid Feedback',
    desc: 'Real-time intelligence for freelancers as they type their bid amount. Instant feedback before submitting.',
    bullets: ['HIGH / FAIR / LOW status indicator', 'Winning probability percentage', 'AI recommendation for optimal bid range', 'Updated in real-time as you type']
  },
  {
    icon: Star, color: '#6C63FF', title: 'AI Best Freelancer Tag',
    desc: 'On the client\'s view, AI highlights the recommended candidate with a star badge. No more confusion in selection.',
    bullets: ['Bid competitiveness × 40%', 'AI quiz score × 35%', 'Profile match × 25%', 'Auto-select mode available']
  },
  {
    icon: Zap, color: '#FF6584', title: 'Project Health Status',
    desc: 'AI continuously monitors your project and displays color-coded health indicators so everyone stays informed.',
    bullets: ['🟢 On Track — All phases on schedule', '🟡 At Risk — Approaching schedule', '🔴 Delayed — Past schedule or unresponsive', 'Calculated from multiple signals']
  },
  {
    icon: CreditCard, color: '#4BB543', title: 'Phase-wise Payments',
    desc: 'Payments happen per milestone with client approval. Complete control over quality at every step.',
    bullets: ['Client approves each phase before payment', 'Instant payment release on approval', 'Remove & replace freelancer mid-project', 'Progress bar shows paid vs pending']
  },
  {
    icon: Users, color: '#FFA500', title: 'AI-Powered Project Creation',
    desc: 'Creating a project takes 2 minutes with AI assistance. No more guessing at budgets or requirements.',
    bullets: ['AI generates detailed description', 'Budget range suggested from market data', 'Skills auto-identified from description', 'Phase breakdown recommended by AI']
  },
  {
    icon: BarChart, color: '#6C63FF', title: 'SaaS Subscription Model',
    desc: 'Flat monthly pricing. No per-transaction commission. Keep 100% of what you earn.',
    bullets: ['Starter: Free (2 projects/month)', 'Pro: ₹999/month (unlimited + AI)', 'Enterprise: ₹4,999/month (teams + analytics)', 'Save thousands vs 20% commission platforms']
  }
];

export default function FeaturesPage() {
  return (
    <div className="page-container">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">Platform <span className="gradient-text">Features</span></h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto">9 innovations that make Lancera the most advanced freelancer marketplace ever built</p>
      </div>

      <div className="space-y-12">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${f.color}22`, border: `1px solid ${f.color}44` }}>
                  <f.icon size={28} style={{ color: f.color }} />
                </div>
                <div>
                  <div className="text-white/40 text-sm font-medium">Feature {i + 1}</div>
                  <h2 className="text-2xl font-bold">{f.title}</h2>
                </div>
              </div>
              <p className="text-white/60 text-lg mb-4 leading-relaxed">{f.desc}</p>
              <ul className="space-y-2">
                {f.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-white/70 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: f.color }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 glass-card p-8" style={{ borderColor: `${f.color}33` }}>
              <div className="flex items-center gap-3 mb-6">
                <f.icon size={32} style={{ color: f.color }} />
                <span className="font-bold text-xl">{f.title}</span>
              </div>
              <div className="space-y-3">
                {f.bullets.map((b, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${f.color}33`, color: f.color }}>{j + 1}</div>
                    <span className="text-sm text-white/80">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
