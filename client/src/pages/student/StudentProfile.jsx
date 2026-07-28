import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { UserCheck, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await API.put('/auth/change-password', { currentPassword, newPassword });
      setMsg('✅ Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Student ID Badge Card */}
      <div className="glass-card p-8 bg-gradient-to-br from-damale-navy-800 to-damale-navy-900 border border-damale-gold-500/40 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-damale-gold-500 to-amber-600 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-damale-gold-400/30">
              {user?.fullName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{user?.fullName}</h2>
              <p className="text-xs text-damale-gold-400 font-mono font-bold">DS Number: {user?.dsNumber}</p>
              <p className="text-xs text-slate-300">Class: {user?.class} • Gender: {user?.gender}</p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-damale-gold-500/20 text-damale-gold-400 text-[10px] font-black uppercase border border-damale-gold-500/30">
            Official Student ID
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-damale-gold-500" /> Change Account Password
        </h3>

        {msg && <p className="text-xs font-bold text-emerald-400">{msg}</p>}
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="glass-input py-2.5"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              minLength="6"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="glass-input py-2.5"
            />
          </div>

          <button type="submit" className="btn-gold py-3 px-6 font-bold uppercase text-xs">
            Update Password
          </button>
        </form>
      </div>

    </div>
  );
};

export default StudentProfile;
