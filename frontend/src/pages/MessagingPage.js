import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Search, Phone, Video, Info, 
  MoreVertical, Smile, Image as ImageIcon, FileText,
  User, Shield, Zap, Clock, Check, CheckCheck, ArrowLeft, X
} from 'lucide-react';
import io from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function MessagingPage() {
  const { id, userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat]     = useState(null);
  const [messages, setMessages]           = useState([]);
  const [msgInput, setMsgInput]           = useState('');
  const [socket, setSocket]               = useState(null);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  
  const scrollRef = useRef();
  const fileInputRef = useRef();

  // Socket Init
  useEffect(() => {
    const token = localStorage.getItem('lancera_token') || localStorage.getItem('token');
    if (!token) return;

    const s = io(API_URL, { auth: { token } });
    setSocket(s);

    s.on('new_message', (m) => {
      // Check if message belongs to active chat
      const isForActive = activeChat && (
        (activeChat.type === 'project' && m.projectId === activeChat._id) ||
        (activeChat.type === 'direct' && (
          (m.senderId === activeChat._id && m.receiverId === user?._id) || 
          (m.senderId === user?._id && m.receiverId === activeChat._id)
        ))
      );

      if (isForActive) {
        setMessages(prev => [...prev, m]);
      }

      // Update last message in sidebar
      setConversations(prev => prev.map(c => {
        const isMatch = (c.type === 'project' && m.projectId === c._id) || 
                        (c.type === 'direct' && (
                          (m.senderId === c._id && m.receiverId === user?._id) || 
                          (m.senderId === user?._id && m.receiverId === c._id)
                        ));
        return isMatch 
          ? { ...c, lastMessage: m.content || (m.messageType === 'image' ? '📷 Image' : '📎 File') }
          : c;
      }));
    });

    return () => s.disconnect();
  }, [activeChat?._id, user?._id]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        const convs = data.data || [];
        setConversations(convs);

        // Auto-select chat based on URL params
        if (id) {
           const projectChat = convs.find(c => c.type === 'project' && c._id === id);
           if (projectChat) setActiveChat(projectChat);
           else {
              // If not in standard list, fetch project info to create temporary entry
              try {
                const { data: pData } = await api.get(`/projects/${id}`);
                setActiveChat({ _id: id, name: pData.data.title, type: 'project' });
              } catch { toast.error('Project not found'); }
           }
        } else if (userId) {
           const directChat = convs.find(c => c.type === 'direct' && c._id === userId);
           if (directChat) setActiveChat(directChat);
           else {
              // Handle new direct message flow
              try {
                const { data: uData } = await api.get(`/users/${userId}`);
                setActiveChat({ _id: userId, name: uData.data.name, type: 'direct' });
              } catch { toast.error('User not found'); }
           }
        } else if (convs.length > 0 && !activeChat) {
           setActiveChat(convs[0]);
        }
      } catch (err) {
        console.error('Fetch conversations error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId]);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    
    const fetchMessages = async () => {
      try {
        const url = activeChat.type === 'project' 
          ? `/messages/${activeChat._id}` 
          : `/messages/direct?userId=${activeChat._id}`;
        
        const { data } = await api.get(url);
        setMessages(data.data || []);
        
        if (socket) {
          socket.emit('join_chat', activeChat._id);
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      }
    };

    fetchMessages();
  }, [activeChat?._id, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChat) return;

    const payload = {
      content: msgInput,
      receiverId: activeChat.type === 'direct' ? activeChat._id : undefined,
    };
    const projectId = activeChat.type === 'project' ? activeChat._id : 'direct';

    try {
      await api.post(`/messages/${projectId}`, payload);
      setMsgInput('');
    } catch { 
      toast.error('Failed to send message'); 
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const fd = new FormData();
    fd.append('file', file);
    const projectId = activeChat.type === 'project' ? activeChat._id : 'direct';
    if (activeChat.type === 'direct') fd.append('receiverId', activeChat._id);

    try {
      await api.post(`/messages/${projectId}/upload`, fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      toast.success('Asset uploaded');
    } catch { 
      toast.error('Upload failed'); 
    }
  };

  const groupMessages = (msgs) => {
    const groups = [];
    msgs.forEach(m => {
      const date = new Date(m.createdAt || m.timestamp).toLocaleDateString();
      let group = groups.find(g => g.date === date);
      if (!group) {
        group = { date, messages: [] };
        groups.push(group);
      }
      group.messages.push(m);
    });
    return groups;
  };

  const grouped = groupMessages(messages);

  if (loading) return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-[#030B18]">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] flex bg-[#030B18] overflow-hidden pt-20">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col shrink-0 bg-dark-2/50 backdrop-blur-xl ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6">
          <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Messages</h2>
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all shadow-xl" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-10 custom-scrollbar">
          {conversations.filter(c => c.name?.toLowerCase().includes(search.toLowerCase())).map(c => (
            <button 
              key={c._id} onClick={() => {
                setActiveChat(c);
                if (c.type === 'project') navigate(`/projects/${c._id}/messages`);
                else navigate(`/messages/direct/${c._id}`);
              }}
              className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all duration-200 border ${
                activeChat?._id === c._id 
                  ? 'bg-primary/10 border-primary/30 shadow-glow-sm' 
                  : 'bg-transparent border-transparent hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-slate-400 overflow-hidden">
                  {c.type === 'project' ? <Zap size={20} className="text-primary"/> : c.name?.[0]}
                </div>
                {c.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#030B18] rounded-full shadow-glow-sm" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                   <h4 className="text-white font-bold text-sm truncate uppercase tracking-tight">{c.name}</h4>
                   <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">{c.time || 'now'}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate font-semibold leading-none opacity-70">
                  {c.lastMessage || 'Open discussion...'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative bg-dark-1/30 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 shadow-premium">
              <Smile size={32} className="text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Initialize Communication</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed font-medium">Connect with your team or freelancers through the Lancera secure network protocols.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0 relative z-10 bg-[#030B18]/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 text-slate-400">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-base font-black text-primary shadow-glow-sm">
                  {activeChat.name?.[0]}
                </div>
                <div>
                   <h3 className="text-white font-black text-sm uppercase tracking-tight leading-tight">{activeChat.name}</h3>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow-sm" />
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Active Connection</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                    <Phone size={18} />
                 </button>
                 <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                    <Video size={18} />
                 </button>
                 <div className="w-px h-6 bg-white/5 mx-1" />
                 <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                    <MoreVertical size={18} />
                 </button>
              </div>
            </div>

            {/* Messages View */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-message-pattern">
              {grouped.map(group => (
                <div key={group.date} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/[0.03]" />
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">{group.date}</span>
                    <div className="h-px flex-1 bg-white/[0.03]" />
                  </div>
                  
                  {group.messages.map((m, i) => {
                    const isOwn = m.senderId === user?._id || m.senderId?._id === user?._id;
                    const senderName = m.senderId?.name || m.senderName || 'User';
                    return (
                      <motion.div 
                        key={m._id || i} initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-4`}
                      >
                        {!isOwn && (
                          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black text-slate-500 uppercase">
                            {senderName?.[0]}
                          </div>
                        )}
                        <div className={`max-w-[70%] space-y-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-[2rem] text-sm leading-relaxed shadow-premium ${
                            isOwn 
                              ? 'bg-primary text-white shadow-glow-primary rounded-tr-none font-medium' 
                              : 'bg-white/5 text-slate-100 border border-white/5 rounded-tl-none backdrop-blur-md'
                          }`}>
                            {m.messageType === 'image' ? (
                              <div className="space-y-2">
                                <img src={`${API_URL}${m.fileUrl}`} alt="Sent Asset" className="max-w-full rounded-2xl border border-white/10" />
                                {m.content && <p className="text-xs opacity-90">{m.content}</p>}
                              </div>
                            ) : m.messageType === 'file' ? (
                              <a href={`${API_URL}${m.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="p-2 rounded-xl bg-white/10 text-primary group-hover:scale-110 transition-transform">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold truncate text-xs">{m.fileName || 'Asset Protocol'}</div>
                                  <div className="text-[10px] opacity-50 uppercase tracking-tighter font-black">Encrypted Document</div>
                                </div>
                              </a>
                            ) : (
                              <div className="whitespace-pre-wrap break-words">
                                {m.content?.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                  part.match(/https?:\/\/[^\s]+/) ? (
                                    <a key={i} href={part} target="_blank" rel="noreferrer" className="underline decoration-white/30 hover:decoration-white transition-all font-bold">
                                      {part}
                                    </a>
                                  ) : part
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 px-2">
                            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{new Date(m.createdAt || m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwn && <CheckCheck size={12} className="text-primary opacity-60" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input Protocol */}
            <div className="p-6 shrink-0 relative z-10 bg-[#030B18]/50 backdrop-blur-md border-t border-white/5">
              <form onSubmit={sendMsg} className="glass-card-dark p-2 border-white/10 flex items-center gap-2 group focus-within:border-primary/50 transition-all shadow-premium">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileInputRef.current.click()} className="p-3.5 rounded-[1.25rem] hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                  <Paperclip size={20} />
                </button>
                <input 
                  value={msgInput} onChange={e => setMsgInput(e.target.value)}
                  placeholder="Communicate secure mission data..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 text-sm py-4 px-2 font-medium"
                />
                <button type="button" className="p-3.5 rounded-[1.25rem] hover:bg-white/5 text-slate-500 hover:text-white transition-colors hidden sm:block">
                  <Smile size={20} />
                </button>
                <button type="submit" disabled={!msgInput.trim()} className="p-4 bg-primary rounded-[1.25rem] text-white shadow-glow-primary hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center">
                   <Send size={20} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Info Protocols Sidebar */}
      <AnimatePresence>
        {activeChat && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className="w-80 border-l border-white/5 bg-[#030B18] shrink-0 hidden xl:flex flex-col p-10"
          >
             <div className="text-center mb-10">
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-primary mx-auto mb-6 shadow-glow-sm">
                  {activeChat.name?.[0]}
                </div>
                <h4 className="text-white font-black text-lg uppercase tracking-tight">{activeChat.name}</h4>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                  {activeChat.type === 'project' ? 'Mission Secured' : 'Encrypted Handshake'}
                </p>
             </div>

             <div className="space-y-10">
                <div>
                   <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Security Detail</h5>
                   <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                         <Shield size={16} className="text-emerald-500" />
                         <span>E2EE Protocol Active</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                         <Clock size={16} className="text-sky-500" />
                         <span>Session Verified</span>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Network Hub</h5>
                   <div className="grid grid-cols-1 gap-3">
                      <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">Identity Profile</button>
                      <button className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all">Flag Encryption</button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
