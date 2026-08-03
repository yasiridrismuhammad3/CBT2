import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  Award,
  CheckCircle2,
  PlayCircle,
  Bell,
  ArrowRight,
  UserCheck,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [availableExams, setAvailableExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, statsRes] = await Promise.all([
          API.get('/exams/available'),
          API.get('/dashboard/stats')
        ]);

        if (examRes.data.success) {
          setAvailableExams(examRes.data.exams);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
          setAnnouncements(statsRes.data.announcements || []);
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Student Welcome Card */}
      <div className="glass-card p-5 sm:p-8 bg-gradient-to-r from-damale-navy-800 via-damale-navy-900 to-slate-900 border border-damale-navy-700/80 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-damale-gold-500 to-amber-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 ring-4 ring-damale-gold-400/30 flex-shrink-0">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-damale-gold-400 font-bold text-xs uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" /> Student CBT Portal
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight truncate">
              Welcome, {user?.fullName}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <span>DS Number: <strong className="text-white font-mono">{user?.dsNumber}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Class: <strong className="text-damale-gold-400 font-bold">{user?.class}</strong></span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/student/exams')}
          className="btn-gold text-xs py-2.5 sm:py-3 px-4 sm:px-5 shadow-lg w-full md:w-auto"
        >
          <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" /> View Active Examinations
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Available CBT Exams</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {availableExams.filter((e) => !e.isTaken).length}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Completed Exams</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {stats?.completedExams || 0}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Average Percentage</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {stats?.avgPercentage || 0}%
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Available Exams Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-damale-navy-700/60 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-damale-gold-500" /> Scheduled Computer-Based Tests
            </h3>
            <p className="text-xs text-slate-400">Select an examination to launch full-screen CBT mode</p>
          </div>
        </div>

        {availableExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {availableExams.map((exam) => (
              <div
                key={exam._id}
                className="p-5 rounded-2xl bg-slate-100/80 dark:bg-damale-navy-900/60 border border-slate-200 dark:border-damale-navy-700 flex flex-col justify-between space-y-4 hover:border-damale-gold-400/60 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-damale-navy-700 text-damale-gold-400">
                      {exam.subject?.name || 'Subject'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      exam.isTaken
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {exam.isTaken ? 'Already Taken' : 'Ready to Start'}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-damale-gold-500" /> {exam.durationMinutes} Minutes</span>
                    <span>•</span>
                    <span>Pass Mark: {exam.passPercentage}%</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-damale-navy-700/60 flex items-center justify-between">
                  {exam.isTaken ? (
                    <button
                      onClick={() => navigate(`/student/result/${exam.resultId}`)}
                      className="btn-secondary text-xs py-2 px-4 w-full"
                    >
                      View Result Sheet ({exam.percentage}%)
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/exam/${exam._id}/take`)}
                      className="btn-gold text-xs py-2.5 px-4 w-full font-bold uppercase tracking-wider"
                    >
                      Start CBT Examination <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            No CBT examinations currently scheduled for your class ({user?.class}).
          </div>
        )}
      </div>

      {/* Announcements */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-damale-gold-500" /> School CBT Announcements
        </h3>
        <div className="space-y-3">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <div key={a._id} className="p-4 rounded-xl bg-damale-navy-900/40 border border-damale-navy-700">
                <h4 className="font-bold text-sm text-damale-gold-400">{a.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{a.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No active announcements.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
