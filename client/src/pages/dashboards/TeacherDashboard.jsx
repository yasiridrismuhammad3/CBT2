import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  HelpCircle,
  Award,
  PlusCircle,
  BookOpen,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-damale-navy-800 to-blue-950 border border-damale-navy-700/80 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" /> Teacher Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage CBT Question Banks, Create Examinations, and Review Student Performance.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/management/exams/create')}
            className="btn-gold text-xs py-2.5 px-4"
          >
            <PlusCircle className="w-4 h-4" /> Create New CBT Exam
          </button>
          <button
            onClick={() => navigate('/management/questions')}
            className="btn-navy text-xs py-2.5 px-4 border border-damale-navy-600"
          >
            <HelpCircle className="w-4 h-4" /> Add Questions
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Assigned Subjects</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {user?.assignedSubjects?.length || 2}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Active CBT Exams</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {stats?.activeExams || 2}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Exams Created</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {stats?.totalExams || 2}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Questions Authored</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {stats?.totalQuestionsCreated || 7}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-damale-gold-500" /> Question Bank & Bulk Import
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Add multiple choice questions with A, B, C, D options, detailed explanations, and optional math formulas or images. Support bulk CSV/Excel question imports.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/management/questions')}
              className="btn-gold text-xs py-2.5 px-4"
            >
              Open Question Bank <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-damale-gold-500" /> Marksheets & PDF Reports
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect class performance, generate position in class rankings, and export official PDF marksheets and Excel spreadsheets for school administration.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/management/results')}
              className="btn-navy text-xs py-2.5 px-4 border border-damale-navy-600"
            >
              View Results Analytics <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
