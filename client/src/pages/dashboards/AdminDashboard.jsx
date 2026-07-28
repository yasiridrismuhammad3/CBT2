import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  HelpCircle,
  Award,
  TrendingUp,
  Plus,
  Bell,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse text-slate-400">
        Loading System Dashboard Metrics...
      </div>
    );
  }

  const stats = data?.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalSubmissions: 0
  };

  // Chart configuration for Pass / Fail ratio
  const barChartData = {
    labels: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'],
    datasets: [
      {
        label: 'Passed Students',
        data: [142, 168, 95, 110, 130],
        backgroundColor: 'rgba(245, 158, 11, 0.85)',
        borderRadius: 8
      },
      {
        label: 'Failed Students',
        data: [18, 12, 25, 20, 15],
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderRadius: 8
      }
    ]
  };

  const doughnutData = {
    labels: ['SS3 Senior', 'SS2 Senior', 'SS1 Senior', 'JSS Junior'],
    datasets: [
      {
        data: [120, 140, 160, 200],
        backgroundColor: ['#D97706', '#1E3A8A', '#3B82F6', '#10B981'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-damale-navy-800 via-damale-navy-900 to-slate-900 border border-damale-navy-700/80 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-damale-gold-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Super Administrator Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            DAMALE SCHOOL KATSINA Overview
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Full system control: Students, Teachers, CBT Question Bank & Results Analytics.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/management/students')}
            className="btn-gold text-xs py-2.5 px-4"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
          <button
            onClick={() => navigate('/management/exams')}
            className="btn-navy text-xs py-2.5 px-4 border border-damale-navy-600"
          >
            <FileSpreadsheet className="w-4 h-4" /> Manage Exams
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
        
        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Students</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.totalStudents}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Teachers</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.totalTeachers}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Subjects</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.totalSubjects}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Exams</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.totalExams}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Questions</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.totalQuestions}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Submissions</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stats.totalSubmissions}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-damale-gold-500" /> CBT Performance Analytics by Subject
              </h3>
              <p className="text-xs text-slate-500">Pass vs Fail statistics across recent mock exams</p>
            </div>
          </div>
          <div className="h-64 pt-2">
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              Student Class Distribution
            </h3>
            <p className="text-xs text-slate-500">Enrolled CBT students by academic level</p>
          </div>
          <div className="h-56 flex items-center justify-center pt-2">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

      </div>

      {/* Recent CBT Results & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Results Feed */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-damale-navy-700/60 pb-3">
            <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-damale-gold-500" /> Recent CBT Exam Submissions
            </h3>
            <button
              onClick={() => navigate('/management/results')}
              className="text-xs font-bold text-damale-gold-500 hover:underline flex items-center gap-1"
            >
              View All Results <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentResults && data.recentResults.length > 0 ? (
              data.recentResults.map((r) => (
                <div
                  key={r._id}
                  className="p-4 rounded-xl bg-slate-100/70 dark:bg-damale-navy-900/60 border border-slate-200/60 dark:border-damale-navy-700/60 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {r.student?.fullName || 'Student'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {r.student?.dsNumber} • {r.student?.class} | {r.exam?.title || 'Exam'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                      r.status === 'Passed'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {r.percentage}% ({r.grade}) - {r.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(r.submittedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No submissions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Announcements Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-damale-navy-700/60 pb-3">
            <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-damale-gold-500" /> Announcements
            </h3>
            <button
              onClick={() => navigate('/management/announcements')}
              className="text-xs font-bold text-damale-gold-500 hover:underline"
            >
              Post Notice
            </button>
          </div>

          <div className="space-y-3">
            {data?.announcements && data.announcements.length > 0 ? (
              data.announcements.map((a) => (
                <div key={a._id} className="p-3.5 rounded-xl bg-damale-navy-900/40 border border-damale-navy-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-white">{a.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{a.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No announcements posted.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
