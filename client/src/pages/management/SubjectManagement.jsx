import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const [subjectData, setSubjectData] = useState({ name: '', code: '', description: '' });
  const [classData, setClassData] = useState({ name: '', category: 'Senior Secondary', arm: 'A' });

  const fetchData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([API.get('/subjects'), API.get('/classes')]);
      if (sRes.data.success) setSubjects(sRes.data.subjects);
      if (cRes.data.success) setClasses(cRes.data.classes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/subjects', subjectData);
      setShowSubjectModal(false);
      setSubjectData({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating subject');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await API.post('/classes', classData);
      setShowClassModal(false);
      setClassData({ name: '', category: 'Senior Secondary', arm: 'A' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating class');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" /> Academic Subjects & Classes
          </h1>
          <p className="text-xs text-slate-500">Configure subjects and grade levels for CBT exam targeting.</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={() => setShowClassModal(true)} className="btn-navy text-xs py-2.5 px-4 border border-damale-navy-600 flex-1 sm:flex-initial">
            <Plus className="w-4 h-4" /> Add Class
          </button>
          <button onClick={() => setShowSubjectModal(true)} className="btn-gold text-xs py-2.5 px-4 font-bold uppercase flex-1 sm:flex-initial">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subjects Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Registered School Subjects</h3>
          <div className="space-y-3">
            {subjects.map((sub) => (
              <div key={sub._id} className="p-4 rounded-xl bg-damale-navy-900/60 border border-damale-navy-700 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-damale-gold-500/20 text-damale-gold-400 font-mono font-bold text-[10px]">
                      {sub.code}
                    </span>
                    <h4 className="font-bold text-sm text-white">{sub.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{sub.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-white">Active School Classes</h3>
          <div className="grid grid-cols-2 gap-3">
            {classes.map((cls) => (
              <div key={cls._id} className="p-4 rounded-xl bg-damale-navy-900/60 border border-damale-navy-700">
                <h4 className="font-bold text-sm text-white">{cls.name}</h4>
                <p className="text-[11px] text-slate-400 uppercase mt-0.5">{cls.category} (Arm {cls.arm})</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card bg-damale-navy-800 p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Create New Subject</h3>
                <button onClick={() => setShowSubjectModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Subject Name</label>
                  <input type="text" required placeholder="Mathematics" value={subjectData.name} onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })} className="glass-input py-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Subject Code</label>
                  <input type="text" required placeholder="MTH301" value={subjectData.code} onChange={(e) => setSubjectData({ ...subjectData, code: e.target.value })} className="glass-input py-2 uppercase font-mono" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowSubjectModal(false)} className="btn-secondary py-2 flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 flex-1 font-bold uppercase">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Class Modal */}
      <AnimatePresence>
        {showClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card bg-damale-navy-800 p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Add School Class</h3>
                <button onClick={() => setShowClassModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Class Name</label>
                  <input type="text" required placeholder="SS 3A" value={classData.name} onChange={(e) => setClassData({ ...classData, name: e.target.value })} className="glass-input py-2" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowClassModal(false)} className="btn-secondary py-2 flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 flex-1 font-bold uppercase">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubjectManagement;
