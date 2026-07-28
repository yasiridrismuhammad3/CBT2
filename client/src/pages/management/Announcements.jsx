import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Bell, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', targetAudience: 'All', priority: 'Normal' });

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get('/announcements');
      if (res.data.success) setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/announcements', formData);
      setShowModal(false);
      setFormData({ title: '', content: '', targetAudience: 'All', priority: 'Normal' });
      fetchAnnouncements();
    } catch (err) {
      alert('Error posting announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete notice?')) return;
    try {
      await API.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Error deleting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-amber-500" /> School CBT Announcement Board
          </h1>
          <p className="text-xs text-slate-500">Post CBT timetable updates and examination instructions to student & teacher dashboards.</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-gold text-xs py-2.5 px-4 font-bold uppercase">
          <Plus className="w-4 h-4" /> Post Notice
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a._id} className="glass-card p-6 border-l-4 border-l-amber-500 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">{a.title}</h3>
              <button onClick={() => handleDelete(a._id)} className="p-1 text-slate-400 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
            <p className="text-[10px] text-amber-400 font-bold uppercase mt-2">
              Audience: {a.targetAudience} • Posted: {new Date(a.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card bg-damale-navy-800 p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Broadcast School Notice</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Notice Title</label>
                  <input type="text" required placeholder="e.g. SS3 CBT Mock Exam Schedule" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="glass-input py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Content Details</label>
                  <textarea required rows="4" placeholder="Enter notice details..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="glass-input py-2" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary py-2 flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 flex-1 font-bold uppercase">Publish Notice</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Announcements;
