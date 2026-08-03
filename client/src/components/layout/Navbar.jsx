import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, ShieldCheck, UserCheck, GraduationCap, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, login } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleQuickSwitch = async (role) => {
    try {
      if (role === 'admin') await login('admin@damale.edu.ng', 'Admin@123');
      if (role === 'teacher') await login('teacher@damale.edu.ng', 'Teacher@123');
      if (role === 'student') await login('DSK/2026/001', 'Student@123');
      navigate(`/dashboard`);
    } catch (err) {
      console.error('Quick switch failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-damale-navy-800/90 backdrop-blur-lg border-b border-slate-200 dark:border-damale-navy-700/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-damale-navy-700 transition flex-shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer min-w-0" onClick={() => navigate('/')}>
            {/* School Logo Emblem */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-damale-gold-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-sm sm:text-lg shadow-lg shadow-amber-500/30 ring-2 ring-damale-gold-300 flex-shrink-0">
              DSK
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-xs sm:text-base tracking-wider text-damale-navy-800 dark:text-white uppercase leading-tight truncate">
                DAMALE SCHOOL <span className="text-damale-gold-500 dark:text-damale-gold-400">KATSINA</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-widest uppercase truncate hidden sm:block">
                Online Examination System (CBT)
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Switch, Theme Toggle, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          
          {/* Quick Demo Role Switcher Toolbar (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-damale-navy-900 p-1 rounded-xl border border-slate-200 dark:border-damale-navy-700 text-xs font-semibold">
            <span className="px-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Demo Switch:</span>
            <button
              onClick={() => handleQuickSwitch('admin')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                user?.role === 'admin'
                  ? 'bg-damale-navy-800 text-damale-gold-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
            <button
              onClick={() => handleQuickSwitch('teacher')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                user?.role === 'teacher'
                  ? 'bg-damale-navy-800 text-damale-gold-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Teacher
            </button>
            <button
              onClick={() => handleQuickSwitch('student')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                user?.role === 'student'
                  ? 'bg-damale-navy-800 text-damale-gold-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Student
            </button>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-damale-navy-700/60 text-slate-600 dark:text-slate-300 hover:text-damale-gold-500 dark:hover:text-damale-gold-400 transition"
            title="Toggle Light / Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* User Profile Info */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-damale-navy-700">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.fullName}</p>
                <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-damale-gold-500/10 text-damale-gold-600 dark:text-damale-gold-400 border border-damale-gold-500/20">
                  {user.role} {user.class ? `(${user.class})` : ''}
                </span>
              </div>

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-damale-navy-700 text-white font-bold flex items-center justify-center ring-2 ring-damale-gold-400/40 text-xs sm:text-sm">
                {user.fullName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth/student')}
              className="btn-gold text-xs py-2 px-3 sm:px-4"
            >
              Portal Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
