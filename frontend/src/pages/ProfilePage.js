import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Globe, Twitter, 
  Linkedin, Github, Edit3, Camera, Shield, 
  Star, Briefcase, DollarSign, Award, Settings,
  LogOut, ChevronRight, ExternalLink, Save, Plus, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats]     = useState({ completed: 12, rating: 4.9, earnings: 125000 });
  const [form, setForm]       = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    orgName: user?.profile?.orgName || '',
    orgWebsite: user?.profile?.orgWebsite || '',
    portfolioLink: user?.profile?.portfolioLink || '',
    githubLink: user?.profile?.githubLink || '',
    linkedinLink: user?.profile?.linkedinLink || '',
    skills: user?.profile?.skills || [],
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setSkills(skills.filter(sk => sk !== s));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { profile: form, skills });
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-white/50 mb-8">Update your profile to improve your recommendation score</p>

        {/* Avatar / Name display */}
        <div className="glass-card p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-white/50 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${user?.role === 'client' ? 'badge-blue' : 'badge-purple'}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          {user?.role === 'freelancer' && (
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold gradient-text">{user?.aiScore || 0}</div>
              <div className="text-white/50 text-xs">AI Score</div>
            </div>
          )}
        </div>

        <form onSubmit={save} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-white/80">About</h3>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Write a bio about yourself, your expertise, and experience..."
              rows={4} className="input-field resize-none" />
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-white/80">Links</h3>
            <div className="space-y-3">
              {user?.role === 'freelancer' ? (
                <>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input value={form.portfolioLink} onChange={e => setForm({ ...form, portfolioLink: e.target.value })}
                      placeholder="Portfolio URL" className="input-field pl-9" />
                  </div>
                  <div className="relative">
                    <Github size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input value={form.githubLink} onChange={e => setForm({ ...form, githubLink: e.target.value })}
                      placeholder="GitHub Profile URL" className="input-field pl-9" />
                  </div>
                  <div className="relative">
                    <Linkedin size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input value={form.linkedinLink} onChange={e => setForm({ ...form, linkedinLink: e.target.value })}
                      placeholder="LinkedIn Profile URL" className="input-field pl-9" />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })}
                      placeholder="Organisation Name" className="input-field pl-9" />
                  </div>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input value={form.orgWebsite} onChange={e => setForm({ ...form, orgWebsite: e.target.value })}
                      placeholder="Organisation Website" className="input-field pl-9" />
                  </div>
                  <div className="relative">
                    <Linkedin size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input value={form.linkedinLink} onChange={e => setForm({ ...form, linkedinLink: e.target.value })}
                      placeholder="LinkedIn URL" className="input-field pl-9" />
                  </div>
                </>
              )}
            </div>
          </div>

          {user?.role === 'freelancer' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 text-white/80">Skills</h3>
              <div className="flex gap-2 mb-3">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g. React.js)" className="input-field flex-1" />
                <button type="button" onClick={addSkill} className="btn-secondary px-4">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="badge-blue flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
