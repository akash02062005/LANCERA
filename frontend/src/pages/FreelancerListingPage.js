import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MessageSquare, Star, User, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FreelancerListingPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState('');
  const [sort, setSort] = useState('aiScore');
  const navigate = useNavigate();

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/freelancers', {
        params: { search, skills, sort }
      });
      setFreelancers(data.data || []);
    } catch {
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchFreelancers(), 500);
    return () => clearTimeout(timer);
  }, [search, skills, sort]);

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2">Find <span className="gradient-text">Top Talent</span></h1>
          <p className="text-white/50">Browse verified freelancers vetted by Lancera AI</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/30" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or bio..." className="input-field pl-10" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-white/30" size={18} />
            <input value={skills} onChange={e => setSkills(e.target.value)}
              placeholder="Filter by skills (e.g. React, Node)..." className="input-field pl-10" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input-field">
            <option value="aiScore">Sort by: AI Score (Highest)</option>
            <option value="newest">Sort by: Newest Joined</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((f, i) => (
            <motion.div key={f._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/20">
                    {f.profile?.avatar ? (
                      <img src={`http://localhost:5000${f.profile.avatar}`} alt={f.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : f.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{f.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold border border-yellow-500/20">
                        <Star size={10} fill="currentColor" /> {f.aiScore} AI SCORE
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{f.profile?.bio || 'No bio provided'}</p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {f.skills?.slice(0, 5).map(s => <span key={s} className="badge-blue text-[10px]">{s}</span>)}
                  {f.skills?.length > 5 && <span className="text-[10px] text-white/30">+{f.skills.length - 5} more</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/messages/direct/${f._id}`)}
                  className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Message
                </button>
                <button onClick={() => navigate(`/profile/${f._id}`)}
                  className="btn-secondary py-2 px-4 text-sm flex items-center justify-center">
                  <User size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && freelancers.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <User size={48} className="mx-auto text-white/10 mb-4" />
          <h3 className="text-xl font-bold">No Freelancers Found</h3>
          <p className="text-white/40">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}
