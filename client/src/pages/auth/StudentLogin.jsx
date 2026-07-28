import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentLogin = () => {
  const [dsNumber, setDsNumber] = useState('DSK/2026/001');
  const [password, setPassword] = useState('Student@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(dsNumber, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your DS Number and Password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-damale-navy-900 via-slate-900 to-damale-navy-800 text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 bg-damale-navy-800/90 border border-damale-navy-700 shadow-2xl relative"
      >
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </button>

        {/* Header */}
        <div className="text-center mt-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-damale-gold-500 to-amber-600 mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/30 ring-4 ring-damale-gold-400/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight">Student Portal Login</h2>
          <p className="text-xs text-damale-gold-400 font-semibold mt-1 uppercase tracking-wider">
            DAMALE SCHOOL KATSINA CBT
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              DS Number (Student Registration Number)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. DSK/2026/001"
                value={dsNumber}
                onChange={(e) => setDsNumber(e.target.value.toUpperCase())}
                className="glass-input pl-12 uppercase font-mono tracking-wider font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-12"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full py-3.5 mt-2 text-sm uppercase tracking-wider font-bold"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Take CBT Exam'}
          </button>
        </form>

        {/* Demo Fill Quick Box */}
        <div className="mt-8 pt-6 border-t border-damale-navy-700/60 text-center">
          <p className="text-xs text-slate-400 mb-3">Sample Student Demo Credentials:</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => { setDsNumber('DSK/2026/001'); setPassword('Student@123'); }}
              className="px-3 py-1.5 rounded-lg bg-damale-navy-700 hover:bg-damale-navy-600 text-damale-gold-400 text-xs font-mono font-bold"
            >
              DS/2026/001
            </button>
            <button
              onClick={() => { setDsNumber('DSK/2026/002'); setPassword('Student@123'); }}
              className="px-3 py-1.5 rounded-lg bg-damale-navy-700 hover:bg-damale-navy-600 text-damale-gold-400 text-xs font-mono font-bold"
            >
              DS/2026/002
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Not a student? Switch to{' '}
          <Link to="/auth/teacher" className="text-damale-gold-400 font-bold hover:underline">
            Teacher Login
          </Link>{' '}
          or{' '}
          <Link to="/auth/admin" className="text-damale-gold-400 font-bold hover:underline">
            Admin Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
