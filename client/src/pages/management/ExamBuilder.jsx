import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Plus, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';

const ExamBuilder = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    targetClasses: ['SS 3A'],
    durationMinutes: 30,
    passPercentage: 50,
    questions: [],
    randomizeQuestions: true,
    randomizeOptions: true,
    showResultImmediately: true,
    status: 'published',
    term: 'Second Term',
    academicSession: '2025/2026'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, qRes] = await Promise.all([
          API.get('/subjects'),
          API.get('/questions')
        ]);
        if (sRes.data.success) {
          setSubjects(sRes.data.subjects);
          if (sRes.data.subjects.length > 0) {
            setFormData((prev) => ({ ...prev, subject: sRes.data.subjects[0]._id }));
          }
        }
        if (qRes.data.success) {
          setQuestions(qRes.data.questions);
          // Default select all questions matching initial subject
          const initialQIds = qRes.data.questions.map((q) => q._id);
          setFormData((prev) => ({ ...prev, questions: initialQIds }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleToggleQuestion = (qId) => {
    if (formData.questions.includes(qId)) {
      setFormData({ ...formData, questions: formData.questions.filter((id) => id !== qId) });
    } else {
      setFormData({ ...formData, questions: [...formData.questions, qId] });
    }
  };

  const handleSelectAllQuestions = () => {
    const filteredQIds = filteredQuestions.map((q) => q._id);
    setFormData({ ...formData, questions: filteredQIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      alert(' select at least 1 question for the examination.');
      return;
    }

    try {
      const res = await API.post('/exams', formData);
      if (res.data.success) {
        alert(`CBT Exam '${res.data.exam.title}' created and published successfully!`);
        navigate('/management/exams');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create exam');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (!formData.subject) return true;
    const subId = typeof q.subject === 'object' ? q.subject?._id : q.subject;
    return subId === formData.subject;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

      <div className="flex justify-between items-center border-b border-slate-700/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-damale-gold-500" /> CBT Examination Wizard
          </h1>
          <p className="text-xs text-slate-400">Configure exam title, subject, duration, question selection, and target classes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Step 1: Exam Settings */}
        <div className="glass-card p-4 sm:p-6 space-y-4">
          <h3 className="font-bold text-base text-white border-b border-slate-700 pb-2">
            1. Exam Details & Scheduling
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 uppercase mb-1">Exam Title</label>
              <input
                type="text"
                required
                placeholder="e.g. SS3 Mock Examination 2026 - Mathematics"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="glass-input py-2.5 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="glass-input py-2.5"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                min="5"
                max="180"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="glass-input py-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">Pass Mark Percentage (%)</label>
              <input
                type="number"
                required
                min="10"
                max="100"
                value={formData.passPercentage}
                onChange={(e) => setFormData({ ...formData, passPercentage: e.target.value })}
                className="glass-input py-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">Target Class</label>
              <select
                value={formData.targetClasses[0]}
                onChange={(e) => setFormData({ ...formData, targetClasses: [e.target.value] })}
                className="glass-input py-2.5"
              >
                <option value="SS 3A">SS 3A</option>
                <option value="SS 3B">SS 3B</option>
                <option value="SS 2A">SS 2A</option>
                <option value="SS 1A">SS 1A</option>
                <option value="JSS 3A">JSS 3A</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.randomizeQuestions}
                onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                className="rounded border-slate-700 text-damale-gold-500 focus:ring-0"
              />
              <span>Randomize Questions</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.randomizeOptions}
                onChange={(e) => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                className="rounded border-slate-700 text-damale-gold-500 focus:ring-0"
              />
              <span>Randomize Answer Options</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showResultImmediately}
                onChange={(e) => setFormData({ ...formData, showResultImmediately: e.target.checked })}
                className="rounded border-slate-700 text-damale-gold-500 focus:ring-0"
              />
              <span>Show Immediate Score</span>
            </label>
          </div>
        </div>

        {/* Step 2: Select Questions */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <div>
              <h3 className="font-bold text-base text-white">2. Select Questions for CBT</h3>
              <p className="text-xs text-slate-400">Selected {formData.questions.length} of {filteredQuestions.length} available questions</p>
            </div>
            <button
              type="button"
              onClick={handleSelectAllQuestions}
              className="text-xs font-bold text-damale-gold-400 hover:underline"
            >
              Select All Subject Questions
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto p-1">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, idx) => {
                const isSelected = formData.questions.includes(q._id);
                return (
                  <div
                    key={q._id}
                    onClick={() => handleToggleQuestion(q._id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${isSelected
                        ? 'bg-damale-gold-500/20 border-damale-gold-400 text-white'
                        : 'bg-damale-navy-900/60 border-damale-navy-700 text-slate-300 hover:border-slate-500'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-damale-gold-500 text-white' : 'border border-slate-600'
                        }`}>
                        {isSelected && '✓'}
                      </div>
                      <span className="font-semibold">{idx + 1}. {q.questionText}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-damale-navy-700 text-slate-400">
                      {q.difficulty}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No questions created for this subject yet. Please add questions in Question Bank first.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-gold w-full py-4 text-sm font-bold uppercase tracking-wider shadow-xl"
        >
          Publish CBT Examination Now <ArrowRight className="w-4 h-4" />
        </button>

      </form>

    </div>
  );
};

export default ExamBuilder;
