import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, Plus, KeyRound, Trash2, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'Teacher@123',
    gender: 'Male',
    assignedSubjects: []
  });

  const fetchData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        API.get('/users?role=teacher'),
        API.get('/subjects')
      ]);
      if (tRes.data.success) setTeachers(tRes.data.users);
      if (sRes.data.success) setSubjects(sRes.data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/users', { ...formData, role: 'teacher' });
      if (res.data.success) {
        alert(`Teacher ${res.data.user.fullName} created successfully!`);
        setShowAddModal(false);
        setFormData({ fullName: '', email: '', password: 'Teacher@123', gender: 'Male', assignedSubjects: [] });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating teacher');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete teacher '${name}'?`)) return;
    try {
      await API.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting teacher.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-500" /> Teacher Staff Directory
          </h1>
          <p className="text-xs text-slate-500">Manage teaching staff accounts and subject assignments.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gold text-xs py-2.5 px-4 font-bold uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-damale-navy-900 border-b border-slate-200 dark:border-damale-navy-700 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
              <th className="p-4">Teacher Name</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Assigned Subjects</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-damale-navy-700/60">
            {teachers.map((t) => (
              <tr key={t._id} className="hover:bg-slate-100/50 dark:hover:bg-damale-navy-700/30">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{t.fullName}</td>
                <td className="p-4 text-slate-400">{t.email}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(t.assignedSubjects || []).map((s) => (
                      <span key={s._id || s} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                        {s.name || 'Subject'}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleDelete(t._id, t.fullName)} className="p-1.5 rounded bg-red-500/10 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card bg-damale-navy-800 p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Add Teaching Staff</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Full Name</label>
                  <input type="text" required placeholder="Malam Ibrahim" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="glass-input py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Email</label>
                  <input type="email" required placeholder="teacher@damale.edu.ng" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="glass-input py-2" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary py-2 flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 flex-1 font-bold uppercase">Save Teacher</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherManagement;
