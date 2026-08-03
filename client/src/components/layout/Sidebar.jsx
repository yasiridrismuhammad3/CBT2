import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  Award,
  Bell,
  Settings,
  X,
  PlusCircle,
  Clock,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const role = user.role;

  const handleQuickSwitch = async (targetRole) => {
    try {
      if (targetRole === 'admin') await login('admin@damale.edu.ng', 'Admin@123');
      if (targetRole === 'teacher') await login('teacher@damale.edu.ng', 'Teacher@123');
      if (targetRole === 'student') await login('DSK/2026/001', 'Student@123');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick switch failed:', err);
    }
  };

  const adminLinks = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/management/students', icon: GraduationCap },
    { name: 'Teachers', path: '/management/teachers', icon: Users },
    { name: 'Subjects & Classes', path: '/management/subjects', icon: BookOpen },
    { name: 'Question Bank', path: '/management/questions', icon: HelpCircle },
    { name: 'Exams & CBT', path: '/management/exams', icon: FileSpreadsheet },
    { name: 'Results & Analytics', path: '/management/results', icon: Award },
    { name: 'Announcements', path: '/management/announcements', icon: Bell },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Question Bank', path: '/management/questions', icon: HelpCircle },
    { name: 'Create Exam', path: '/management/exams/create', icon: PlusCircle },
    { name: 'Exams List', path: '/management/exams', icon: FileSpreadsheet },
    { name: 'Student Results', path: '/management/results', icon: Award },
    { name: 'Announcements', path: '/management/announcements', icon: Bell },
  ];

  const studentLinks = [
    { name: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Available Exams', path: '/student/exams', icon: Clock },
    { name: 'My CBT Results', path: '/student/results', icon: Award },
    { name: 'My Profile', path: '/student/profile', icon: UserCheck },
  ];

  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-damale-navy-800 border-r border-slate-200 dark:border-damale-navy-700 shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Sidebar Header */}
              <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-damale-navy-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-damale-gold-500 text-white font-bold flex items-center justify-center text-sm shadow">
                    DSK
                  </div>
                  <span className="font-extrabold text-sm text-damale-navy-800 dark:text-white uppercase tracking-wider">
                    Portal Menu
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Identity Box */}
              <div className="p-4 mx-4 mt-4 bg-slate-100 dark:bg-damale-navy-900/80 rounded-xl border border-slate-200/80 dark:border-damale-navy-700/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-damale-gold-500 to-amber-600 text-white font-black flex items-center justify-center shadow-md flex-shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                  <p className="text-[11px] font-semibold text-damale-gold-500 uppercase tracking-wide">
                    {user.role} {user.dsNumber ? `• ${user.dsNumber}` : ''}
                  </p>
                </div>
              </div>

              {/* Demo Role Switcher (Mobile Drawer) */}
              <div className="mx-4 mt-3 p-2 bg-slate-100 dark:bg-damale-navy-900 rounded-xl border border-slate-200 dark:border-damale-navy-700 text-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 px-1">Switch Demo Account:</p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                      user?.role === 'admin'
                        ? 'bg-damale-navy-800 text-damale-gold-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('teacher')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                      user?.role === 'teacher'
                        ? 'bg-damale-navy-800 text-damale-gold-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" /> Teacher
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('student')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                      user?.role === 'student'
                        ? 'bg-damale-navy-800 text-damale-gold-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-3 h-3" /> Student
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-damale-gold-500 to-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-damale-navy-700/50 hover:text-damale-gold-500 dark:hover:text-damale-gold-400'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer info */}
            <div className="p-4 border-t border-slate-200 dark:border-damale-navy-700 text-center">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                DAMALE SCHOOL KATSINA © 2026
              </p>
              <p className="text-[10px] text-damale-gold-500 font-medium">CBT Engine v1.0.0</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
