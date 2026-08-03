import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { HelpCircle, Plus, Trash2, Edit, Upload, Eye, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQ, setPreviewQ] = useState(null);

  // Question Form
  const [formData, setFormData] = useState({
    subject: '',
    class: 'SS 3A',
    questionText: '',
    questionImage: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: '',
    marks: 1,
    difficulty: 'Medium'
  });

  const fetchData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        API.get(`/questions?subject=${selectedSubject}&class=${selectedClass}&search=${search}`),
        API.get('/subjects')
      ]);
      if (qRes.data.success) setQuestions(qRes.data.questions);
      if (sRes.data.success) {
        setSubjects(sRes.data.subjects);
        if (sRes.data.subjects.length > 0 && !formData.subject) {
          setFormData((prev) => ({ ...prev, subject: sRes.data.subjects[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSubject, selectedClass, search]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        subject: formData.subject,
        class: formData.class,
        questionText: formData.questionText,
        questionImage: formData.questionImage,
        options: [
          { key: 'A', text: formData.optionA },
          { key: 'B', text: formData.optionB },
          { key: 'C', text: formData.optionC },
          { key: 'D', text: formData.optionD }
        ],
        correctOption: formData.correctOption,
        explanation: formData.explanation,
        marks: Number(formData.marks) || 1,
        difficulty: formData.difficulty
      };

      const res = await API.post('/questions', payload);
      if (res.data.success) {
        alert('Question created successfully!');
        setShowAddModal(false);
        setFormData({
          subject: subjects[0]?._id || '',
          class: 'SS 3A',
          questionText: '',
          questionImage: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctOption: 'A',
          explanation: '',
          marks: 1,
          difficulty: 'Medium'
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating question');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question from question bank?')) return;
    try {
      await API.delete(`/questions/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting question');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-damale-gold-500" /> CBT Question Bank Repository
          </h1>
          <p className="text-xs text-slate-500">Create, edit, preview and manage multiple choice questions with explanations.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gold text-xs py-2.5 px-4 font-bold uppercase tracking-wider w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add New Question
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search question keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input py-2 text-xs"
        />

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="glass-input py-2 text-xs"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="glass-input py-2 text-xs"
        >
          <option value="">All Classes</option>
          <option value="SS 3A">SS 3A</option>
          <option value="SS 2A">SS 2A</option>
          <option value="SS 1A">SS 1A</option>
        </select>
      </div>

      {/* Question Cards Grid */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <div key={q._id} className="glass-card p-4 sm:p-5 space-y-3 hover:border-damale-gold-400/50 transition">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2 py-0.5 rounded bg-damale-gold-500/20 text-damale-gold-400 font-bold text-[10px] uppercase">
                    {q.subject?.name || 'Subject'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-damale-navy-700 text-slate-300 font-semibold text-[10px]">
                    {q.class}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setPreviewQ(q); setShowPreviewModal(true); }}
                    className="p-1.5 rounded bg-slate-700 text-slate-300 hover:text-white"
                    title="Preview Question"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-white">
                {idx + 1}. {q.questionText}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-2.5 rounded-lg border ${
                      opt.key === q.correctOption
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold'
                        : 'bg-damale-navy-900/60 border-damale-navy-700 text-slate-300'
                    }`}
                  >
                    <strong>{opt.key}:</strong> {opt.text} {opt.key === q.correctOption && ' (Correct Key)'}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-8 text-center text-slate-400">
            No questions found in repository matching criteria.
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card bg-damale-navy-800 p-5 sm:p-6 max-w-lg w-full space-y-4 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Add Question to Bank</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="glass-input py-2"
                    >
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Class Level</label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="glass-input py-2"
                    >
                      <option value="SS 3A">SS 3A</option>
                      <option value="SS 2A">SS 2A</option>
                      <option value="SS 1A">SS 1A</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Question Statement</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Enter question wording..."
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Option A</label>
                    <input type="text" required placeholder="Choice A" value={formData.optionA} onChange={(e) => setFormData({ ...formData, optionA: e.target.value })} className="glass-input py-2" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Option B</label>
                    <input type="text" required placeholder="Choice B" value={formData.optionB} onChange={(e) => setFormData({ ...formData, optionB: e.target.value })} className="glass-input py-2" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Option C</label>
                    <input type="text" required placeholder="Choice C" value={formData.optionC} onChange={(e) => setFormData({ ...formData, optionC: e.target.value })} className="glass-input py-2" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">Option D</label>
                    <input type="text" required placeholder="Choice D" value={formData.optionD} onChange={(e) => setFormData({ ...formData, optionD: e.target.value })} className="glass-input py-2" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Correct Answer Key</label>
                  <select
                    value={formData.correctOption}
                    onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                    className="glass-input py-2 font-bold text-damale-gold-400"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Solution Explanation (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Step by step solution..."
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary py-2 flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 flex-1 font-bold uppercase">Save Question</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewQ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card bg-damale-navy-800 p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Student CBT Question Preview</h3>
                <button onClick={() => setShowPreviewModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-sm text-white">{previewQ.questionText}</h4>
                <div className="space-y-2">
                  {previewQ.options.map((opt) => (
                    <div key={opt.key} className="p-3 rounded-xl bg-damale-navy-900 border border-damale-navy-700 text-slate-200">
                      <strong>{opt.key}:</strong> {opt.text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default QuestionBank;
