import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, List, DollarSign, Clock, Layout, Save, 
  Trash2, Plus, Info, CheckCircle, ChevronRight, 
  ChevronLeft, AlertCircle, Shield, Target, Lightbulb, Zap, Lock, X, Timer
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Identity', icon: Target, desc: 'What are you building?' },
  { id: 2, title: 'Resources', icon: DollarSign, desc: 'Budget & Timeline' },
  { id: 3, title: 'Roadmap', icon: List, desc: 'Project Phases' },
  { id: 4, title: 'Strategy', icon: Shield, desc: 'Community & Privacy' },
  { id: 5, title: 'Review', icon: CheckCircle, desc: 'Final Audit' }
];

export default function CreateProjectPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({ desc: false, budget: false, skills: false, phases: false });
  const [skillInput, setSkillInput] = useState('');
  const [phasesCount, setPhasesCount] = useState(1);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', skills: [],
    budget: '', duration: '', minBid: '',
    freelancerLimit: 3, bidDuration: 30,
    bidStartTime: '', aiGenerated: false,
    closedCommunity: { enabled: false, manualVerification: false },
    phases: [{ name: '', description: '', paymentAmount: '', deadline: '' }]
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const aiLoad = (key) => setAiLoading(l => ({ ...l, [key]: true }));
  const aiDone = (key) => setAiLoading(l => ({ ...l, [key]: false }));

  const aiGenerateDescription = async () => {
    if (!form.title) return toast.error('Enter a project title first');
    aiLoad('desc');
    try {
      const { data } = await api.post('/projects/ai/description', { 
        title: form.title, 
        description: form.description,
        keywords: form.skills.join(', ') 
      });
      set('description', data.data.description);
      set('aiGenerated', true);
      toast.success('AI description generated!');
    } catch { toast.error('AI generation failed'); } finally { aiDone('desc'); }
  };

  const aiSuggestBudget = async () => {
    if (!form.description) return toast.error('Add a description first');
    aiLoad('budget');
    try {
      const { data } = await api.post('/projects/ai/budget', { description: form.description, skills: form.skills });
      toast.success(`AI suggests ₹${data.data.minBidFloor.toLocaleString()} – ₹${data.data.maxBudget.toLocaleString()}`);
      set('budget', data.data.maxBudget);
      set('minBid', data.data.minBidFloor);
    } catch { toast.error('Budget suggestion failed'); } finally { aiDone('budget'); }
  };

  const aiIdentifySkills = async () => {
    if (!form.description) return toast.error('Add a description first');
    aiLoad('skills');
    try {
      const { data } = await api.post('/projects/ai/skills', { description: form.description });
      setForm(f => ({ ...f, skills: [...new Set([...f.skills, ...data.data])] }));
      toast.success('Skills identified by AI!');
    } catch { toast.error('Skill identification failed'); } finally { aiDone('skills'); }
  };

  const aiSuggestPhases = async () => {
    if (!form.description) return toast.error('Add a description first');
    aiLoad('phases');
    try {
      const { data } = await api.post('/projects/ai/phases', { description: form.description, duration: form.duration });
      const totalBudget = Number(form.budget) || 10000;
      const phases = data.data.map(p => ({
        name: p.name, description: p.description,
        deadline: '', paymentAmount: Math.round(totalBudget * (p.suggestedPaymentPercent || 25) / 100)
      }));
      setForm(f => ({ ...f, phases }));
      setPhasesCount(phases.length);
      toast.success('AI suggested phases!');
    } catch { toast.error('Phase suggestion failed'); } finally { aiDone('phases'); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const initPhases = (count) => {
    const total = Number(form.budget) || 10000;
    const phases = Array.from({ length: count }, (_, i) => ({
      name: `Phase ${i + 1}`, description: '', deadline: '',
      paymentAmount: Math.round(total / count)
    }));
    setForm(f => ({ ...f, phases }));
    setPhasesCount(count);
  };

  const updatePhase = (i, field, val) => {
    const phases = [...form.phases];
    phases[i] = { ...phases[i], [field]: val };
    setForm(f => ({ ...f, phases }));
  };

  const submit = async () => {
    if (!form.title || !form.description || !form.budget || !form.minBid || !form.duration || !form.bidStartTime || !form.bidDuration) {
      return toast.error('Please fill all required protocol data');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      toast.success('Project deployed successfully!');
      navigate(`/projects/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deployment error');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-[#030B18] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Centered Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tight">Initialize <span className="gradient-text">Protocol Hub</span></h1>
          <p className="text-slate-500 text-sm font-medium max-w-lg mx-auto leading-relaxed">Systematically register your project requirements to find optimal network talent.</p>
        </div>

        {/* Centered Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-4 custom-scrollbar">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div onClick={() => i + 1 < step && setStep(i + 1)} className={`flex items-center gap-3 shrink-0 cursor-pointer transition-all ${i + 1 <= step ? 'opacity-100' : 'opacity-30 hover:opacity-50'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all ${
                  i + 1 < step ? 'bg-primary border-primary text-white shadow-glow-sm' : 
                  i + 1 === step ? 'border-primary text-primary shadow-glow-sm' : 'border-white/10 text-slate-500'
                }`}>
                  {i + 1 < step ? '✓' : s.id}
                </div>
                <div className="hidden sm:block">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-0.5">{s.title}</div>
                  <div className="text-[11px] font-bold text-white whitespace-nowrap">{s.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 md:w-12 h-px shrink-0 ${i + 1 < step ? 'bg-primary' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="relative">
          {/* Subtle decoration elements since sidebar is gone */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full" />

          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-dark p-10 md:p-14 border-white/5 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
             
             <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
                <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-glow-sm">
                   <currentStep.icon size={28} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white tracking-tight">{currentStep.title} Requirements</h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Section {step} Protocol</p>
                </div>
             </div>

             {/* Step 1: Identity */}
             {step === 1 && (
               <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Project Identifier (Title)</label>
                    <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Architecting a Decentralized Exchange" className="input-field py-4" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission Blueprint (Description)</label>
                      <button type="button" onClick={aiGenerateDescription} disabled={aiLoading.desc} className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50">
                        <Sparkles size={12} /> {aiLoading.desc ? 'Processing...' : 'AI Refine'}
                      </button>
                    </div>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Define the core objectives and technical requirements..." rows={6} className="input-field py-4 resize-none leading-relaxed" />
                  </div>
               </div>
             )}

             {/* Step 2: Resources */}
             {step === 2 && (
               <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Budget Endpoint (₹)</label>
                        <button type="button" onClick={aiSuggestBudget} disabled={aiLoading.budget} className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-white disabled:opacity-50">
                          AI Matrix
                        </button>
                      </div>
                      <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} className="input-field py-4" placeholder="00.00" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Starting Bid Floor (₹)</label>
                      <input type="number" value={form.minBid} onChange={e => set('minBid', e.target.value)} className="input-field py-4" placeholder="00.00" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Estimated Project Duration</label>
                    <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 1 Month" className="input-field py-4" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-white/5">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Timer size={12} className="text-primary" /> Scheduled Date
                        </label>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} className="text-primary" /> Scheduled Time
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <input 
                              type="date" 
                              value={form.bidStartTime ? form.bidStartTime.split('T')[0] : ''} 
                              onChange={e => {
                                const time = form.bidStartTime?.split('T')[1] || '12:00';
                                set('bidStartTime', `${e.target.value}T${time}`);
                              }} 
                              className="input-field py-4 text-xs font-bold" 
                           />
                        </div>
                        <div className="relative">
                           <input 
                              type="time" 
                              value={form.bidStartTime ? form.bidStartTime.split('T')[1] : ''} 
                              onChange={e => {
                                const date = form.bidStartTime?.split('T')[0] || new Date().toISOString().split('T')[0];
                                set('bidStartTime', `${date}T${e.target.value}`);
                              }} 
                              className="input-field py-4 text-xs font-bold" 
                           />
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500 px-1 font-medium">Protocol required: Select start date and precise UTC time.</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Clock size={12} className="text-primary" /> Bid Duration (Min)
                      </label>
                      <input 
                        type="number" 
                        value={form.bidDuration} 
                        onChange={e => set('bidDuration', parseInt(e.target.value))} 
                        placeholder="e.g. 30" 
                        className="input-field py-4" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Target size={12} className="text-primary" /> Bid Capacity Limit
                      </label>
                      <input 
                        type="number" 
                        value={form.freelancerLimit} 
                        onChange={e => set('freelancerLimit', parseInt(e.target.value))} 
                        placeholder="e.g. 10" 
                        className="input-field py-4" 
                      />
                    </div>
                  </div>
               </div>
             )}

             {/* Step 3: Roadmap */}
             {step === 3 && (
               <div className="space-y-10">
                  <div>
                    <div className="flex items-center justify-between px-1 mb-5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phase Distribution</label>
                      <button type="button" onClick={aiSuggestPhases} disabled={aiLoading.phases} className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-white disabled:opacity-50 flex items-center gap-1.5">
                        <Sparkles size={12}/> AI Mapping
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-10">
                      {[2, 3, 4, 5].map(n => (
                        <button key={n} type="button" onClick={() => initPhases(n)} className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${phasesCount === n ? 'bg-primary border-primary text-white shadow-glow-sm' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}>
                          {n} Blocks
                        </button>
                      ))}
                    </div>
                    <div className="space-y-6">
                      {form.phases.map((p, i) => (
                        <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-5 group focus-within:border-primary/30 transition-all shadow-premium">
                           <div className="flex items-center gap-4">
                              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center border border-primary/20">{i+1}</span>
                              <input value={p.name} onChange={e => updatePhase(i, 'name', e.target.value)} className="bg-transparent border-none focus:ring-0 text-white font-black text-base flex-1 p-0 uppercase tracking-tight" placeholder="Phase Identifier" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Deadline Endpoint</label>
                                <input type="date" value={p.deadline} onChange={e => updatePhase(i, 'deadline', e.target.value)} className="input-field py-3 text-[11px] uppercase font-bold" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Resource Allocation (₹)</label>
                                <input type="number" value={p.paymentAmount} onChange={e => updatePhase(i, 'paymentAmount', e.target.value)} className="input-field py-3 text-[11px] font-bold" placeholder="Amount" />
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
             )}

             {/* Step 4: Strategy */}
             {step === 4 && (
               <div className="space-y-10">
                  <div onClick={() => set('closedCommunity', { ...form.closedCommunity, enabled: !form.closedCommunity.enabled })} className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group ${form.closedCommunity.enabled ? 'bg-primary/5 border-primary/40 shadow-glow-sm' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-2xl border transition-all ${form.closedCommunity.enabled ? 'bg-primary text-white border-primary shadow-glow-sm' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                            <Lock size={24} />
                          </div>
                          <div>
                            <div className="text-base font-black text-white mb-1 uppercase tracking-tight">Private Protocol Access</div>
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-sm">Restrict mission access to a verified circle of expert freelancers via encrypted code.</p>
                          </div>
                       </div>
                       <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${form.closedCommunity.enabled ? 'bg-primary' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${form.closedCommunity.enabled ? 'left-8 shadow-glow-sm' : 'left-1'}`} />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block opacity-70">Stack Intelligence Requirements</label>
                    <div className="flex gap-3">
                       <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Identify skill node..." className="input-field py-4" />
                       <button type="button" onClick={addSkill} className="px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:border-primary hover:shadow-glow-sm transition-all">Add Node</button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                       {form.skills.map(s => (
                         <div key={s} className="px-5 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[10px] font-black text-primary flex items-center gap-3 group hover:border-primary/50 transition-all uppercase tracking-widest">
                            {s}
                            <button type="button" onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(sk => sk !== s) }))} className="text-slate-600 hover:text-red-500 transition-colors"><X size={14}/></button>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
             )}

             {/* Step 5: Review */}
             {step === 5 && (
               <div className="space-y-8">
                  <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border-2 border-emerald-500/10 flex items-start gap-6 shadow-glow-sm">
                     <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500">
                        <CheckCircle size={28}/>
                     </div>
                     <div>
                        <div className="text-lg font-black text-white mb-1 uppercase tracking-tight">Audit Report: Success</div>
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed">Your project proposal has been systematically audited. All protocols are verified and ready for deployment to the network.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 shadow-premium">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Total Resource Allocation</div>
                        <div className="text-2xl font-black text-white">₹{Number(form.budget).toLocaleString()}</div>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 shadow-premium">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Mission Deadline</div>
                        <div className="text-2xl font-black text-white">{form.duration}</div>
                    </div>
                  </div>
               </div>
             )}

             <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
                <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="flex items-center gap-2 px-8 py-3 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] transition-all disabled:opacity-0 active:scale-95">
                   <ChevronLeft size={16} /> Back
                </button>
                {step < STEPS.length ? (
                  <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow-primary flex items-center gap-3 hover:scale-[1.03] active:scale-95 transition-all">
                    Next Protocol <ChevronRight size={16}/>
                  </button>
                ) : (
                  <button type="button" onClick={submit} disabled={loading} className="btn-primary px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-glow-primary flex items-center gap-3 hover:scale-[1.03] active:scale-95 transition-all">
                    {loading ? 'Processing...' : <>Deploy Project <Sparkles size={16}/></>}
                  </button>
                )}
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
