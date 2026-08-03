import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  LogIn,
  LogOut,
  AlertTriangle,
  Clock,
  Users,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Ban
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSecurityDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/auditlogs');
      if (res.data.success) {
        setLogs(res.data.logs);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const actionTypes = ['ALL', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE'];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.dsNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalLogins: logs.filter((l) => l.action === 'LOGIN').length,
    failedLogins: logs.filter((l) => l.action === 'LOGIN_FAILED').length,
    activeToday: logs.filter((l) => {
      const today = new Date().toDateString();
      return new Date(l.createdAt).toDateString() === today;
    }).length,
    uniqueUsers: [...new Set(logs.map((l) => l.user?._id).filter(Boolean))].length,
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN': return <LogIn className="w-3.5 h-3.5 text-emerald-400" />;
      case 'LOGIN_FAILED': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      case 'LOGOUT': return <LogOut className="w-3.5 h-3.5 text-slate-400" />;
      case 'PASSWORD_CHANGE': return <Lock className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getActionBadge = (action) => {
    const map = {
      LOGIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      LOGIN_FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
      LOGOUT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      PASSWORD_CHANGE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return map[action] || 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" /> Security Center
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            CBT Security & Audit Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor all login activity, failed attempts, and system security events in real time.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="btn-navy text-xs py-2.5 px-4 border border-damale-navy-600 flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Last refresh timestamp */}
      <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
        <Clock className="w-3 h-3" /> Last updated: {lastRefresh.toLocaleTimeString()}
      </p>

      {/* Security KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Logins',
            value: stats.totalLogins,
            icon: LogIn,
            color: 'text-emerald-400',
            bg: 'border-l-emerald-500',
            desc: 'All time successful'
          },
          {
            label: 'Failed Attempts',
            value: stats.failedLogins,
            icon: XCircle,
            color: 'text-red-400',
            bg: 'border-l-red-500',
            desc: 'Login failures recorded'
          },
          {
            label: "Today's Activity",
            value: stats.activeToday,
            icon: Activity,
            color: 'text-amber-400',
            bg: 'border-l-amber-500',
            desc: 'Events logged today'
          },
          {
            label: 'Unique Users',
            value: stats.uniqueUsers,
            icon: Users,
            color: 'text-blue-400',
            bg: 'border-l-blue-500',
            desc: 'Distinct accounts seen'
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              whileHover={{ y: -2 }}
              className={`glass-card p-4 sm:p-5 border-l-4 ${card.bg}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold">{card.label}</p>
                  <p className={`text-2xl sm:text-3xl font-black mt-1 ${card.color}`}>{card.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-slate-800 ${card.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">{card.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Security Alerts Banner */}
      {stats.failedLogins > 0 && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-300">Security Notice</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats.failedLogins} failed login attempt(s) recorded. Review the audit log below and consider resetting affected accounts if suspicious activity is detected.
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, DS number, or event details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-9 py-2.5 text-xs w-full"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="glass-input py-2.5 text-xs sm:w-48"
        >
          {actionTypes.map((a) => (
            <option key={a} value={a}>{a === 'ALL' ? 'All Events' : a.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-damale-navy-700/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-damale-gold-500" /> Live Audit Log
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-damale-navy-700 text-slate-400">
            {filteredLogs.length} events
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center animate-pulse text-slate-400 text-sm">
            Loading security events...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="font-bold text-slate-400">No security events found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || filterAction !== 'ALL' ? 'Try adjusting your filters' : 'Activity will appear here as users log in and out.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-full block">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="bg-damale-navy-900 border-b border-damale-navy-700 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="p-4">Time</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-damale-navy-700/40">
                {filteredLogs.map((log) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-damale-navy-700/20 transition ${log.action === 'LOGIN_FAILED' ? 'bg-red-500/5' : ''}`}
                  >
                    <td className="p-4 text-slate-500 whitespace-nowrap font-mono text-[10px]">
                      {formatTime(log.createdAt)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white text-[11px]">{log.user?.fullName || '—'}</p>
                      {log.user?.dsNumber && (
                        <p className="text-[10px] text-slate-500 font-mono">{log.user.dsNumber}</p>
                      )}
                      {log.user?.role && (
                        <p className="text-[10px] text-damale-gold-500 uppercase">{log.user.role}</p>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] max-w-[200px] truncate">
                      {log.details || '—'}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                      {log.ipAddress || '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-damale-gold-500" /> Security Recommendations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Lock, text: 'Ensure all student accounts have strong passwords or are PIN-only', status: 'ok' },
            { icon: Eye, text: 'Review failed login attempts regularly for suspicious patterns', status: stats.failedLogins > 5 ? 'warn' : 'ok' },
            { icon: Users, text: 'Deactivate graduated or inactive student accounts promptly', status: 'ok' },
            { icon: Activity, text: 'Audit log is enabled and recording all system events', status: 'ok' },
          ].map((rec, i) => {
            const Icon = rec.icon;
            return (
              <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${rec.status === 'warn' ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${rec.status === 'warn' ? 'text-amber-400' : 'text-emerald-400'}`} />
                <p className="text-[11px] text-slate-300">{rec.text}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AdminSecurityDashboard;
