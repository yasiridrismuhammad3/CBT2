import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Award,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-damale-navy-800 to-damale-navy-900 text-white selection:bg-damale-gold-500">

      {/* Top Banner Header */}
      <header className="px-6 py-5 border-b border-damale-navy-700/50 backdrop-blur-md sticky top-0 z-50 bg-damale-navy-900/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-damale-gold-500 to-amber-600 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-amber-500/30 ring-2 ring-damale-gold-400">
              DS
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-wider text-white uppercase leading-tight">
                DAMALE SCHOOL <span className="text-damale-gold-400">KATSINA</span>
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
                Online Examination System (CBT Portal)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-gold text-sm py-2 px-5"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth/student')}
                className="btn-gold text-sm py-2 px-5"
              >
                Student Portal Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-damale-gold-500/10 border border-damale-gold-500/30 text-damale-gold-400 text-xs font-bold uppercase tracking-wider"
          >
            <Zap className="w-4 h-4" /> Next-Generation Examination Portal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-tight"
          >
            Empowering Academic Excellence Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-damale-gold-400 via-amber-300 to-yellow-500">Secure CBT</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed"
          >
            Welcome to the official Computer-Based Testing platform for <strong>DAMALE SCHOOL KATSINA</strong>. Built for real-time exam execution, instant evaluation, and transparent academic analytics.
          </motion.p>
        </div>

        {/* Portal Access Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">

          {/* Student Portal Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/auth/student')}
            className="glass-card bg-damale-navy-800/80 p-8 border border-damale-navy-700/80 hover:border-damale-gold-400/80 cursor-pointer rounded-2xl group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-damale-gold-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Student Portal</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Login with your official DS Number and password to attempt scheduled CBT examinations.
            </p>
            <div className="flex items-center text-damale-gold-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
              Access Student Login <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </motion.div>

          {/* Teacher Portal Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/auth/teacher')}
            className="glass-card bg-damale-navy-800/80 p-8 border border-damale-navy-700/80 hover:border-damale-gold-400/80 cursor-pointer rounded-2xl group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-damale-navy-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Teacher Portal</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Create subject exams, manage question banks, bulk import questions, and monitor results.
            </p>
            <div className="flex items-center text-blue-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
              Access Teacher Login <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </motion.div>

          {/* Super Admin Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/auth/admin')}
            className="glass-card bg-damale-navy-800/80 p-8 border border-damale-navy-700/80 hover:border-damale-gold-400/80 cursor-pointer rounded-2xl group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Super Admin</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Full control over students, teachers, subjects, exam schedules, system settings, and exports.
            </p>
            <div className="flex items-center text-purple-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
              Access Admin Portal <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </motion.div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-damale-navy-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-damale-navy-700 text-damale-gold-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Real-Time Timer</h4>
              <p className="text-xs text-slate-400">Auto-saves & auto-submits</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-damale-navy-700 text-damale-gold-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Exam Lock Mode</h4>
              <p className="text-xs text-slate-400">Anti-cheat & full screen</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-damale-navy-700 text-damale-gold-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Instant Results</h4>
              <p className="text-xs text-slate-400">Automated grading & marks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-damale-navy-700 text-damale-gold-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">PDF / Excel Export</h4>
              <p className="text-xs text-slate-400">Class reports & ranking</p>
            </div>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-damale-navy-700/60 text-center text-xs text-slate-400">
        <p><strong>DAMALE SCHOOL KATSINA</strong> — Online Examination System (CBT) © 2026. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
