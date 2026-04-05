import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  { q: 'How does the reverse auction work?', a: 'Clients post a project with a maximum budget. Freelancers compete by bidding lower and lower amounts. The freelancer with the lowest bid when the timer hits zero wins the project.' },
  { q: 'What is the AI Quiz?', a: 'Before bidding, freelancers must take a 5-question AI-generated quiz based on the actual project description. Questions are practical and relevant, with a 7-second timer per question.' },
  { q: 'What is Closed Community Circle?', a: 'An optional feature where clients create private bidding rooms. They share an invite code with trusted freelancers, then accept or reject join requests before bidding begins.' },
  { q: 'How are payments handled?', a: 'Payments are made phase-by-phase. Each phase has a pre-allocated amount. The client approves the phase deliverable, then the payment is released to the freelancer instantly.' },
  { q: 'Why subscription instead of commission?', a: 'Traditional platforms take 10-20% per transaction. Our flat subscription means high-volume users save thousands. You keep 100% of what you earn.' },
  { q: 'Can I remove a freelancer mid-project?', a: 'Yes. If a freelancer is not performing, the client can remove them from remaining phases. Already-approved phases and payments are kept by the freelancer. Remaining phases go back to bidding.' }
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Get in <span className="gradient-text">Touch</span></h1>
        <p className="text-white/50">Have a question? We're here to help.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Contact Form */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} className="text-primary"/> Send a Message</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Your Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required className="input-field" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" required className="input-field" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your question or issue in detail..." rows={5} required className="input-field resize-none" />
            </div>
            <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold">Email Support</div>
              <div className="text-white/50 text-sm">support@lancera.in</div>
              <div className="text-white/30 text-xs">Response within 24 hours</div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">About Lancera</h3>
            <p className="text-white/60 text-sm">Lancera is built by Green Sync Innovators as part of Hack Wise 2.0. We're revolutionizing how freelancers and clients connect through AI-powered reverse auction bidding.</p>
            <p className="text-white/40 text-xs mt-3">Hack Wise 2.0 | Table 07</p>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              {[['How it works', '/#how-it-works'], ['Pricing', '/subscription'], ['Features', '/features'], ['Browse Projects', '/projects']].map(([label, href]) => (
                <a key={href} href={href} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />{label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <motion.div key={i} className="glass-card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-5 flex items-center justify-between text-left">
                <span className="font-medium">{faq.q}</span>
                {openFaq === i ? <ChevronUp size={18} className="text-primary flex-shrink-0" /> : <ChevronDown size={18} className="text-white/40 flex-shrink-0" />}
              </button>
              <motion.div initial={false} animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                className="overflow-hidden">
                <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{faq.a}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
