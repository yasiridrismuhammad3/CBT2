import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  GraduationCap,
  Plus,
  Search,
  KeyRound,
  Trash2,
  Edit,
  Upload,
  Download,
  X,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form State for New Student
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    class: 'SS 3A',
    gender: 'Male',
    dsNumber: '',
    password: 'Student@123'
  });

  const [bulkCsvText, setBulkCsvText] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await API.get(`/users?role=student&search=${search}&class=${selectedClass}`);
      if (res.data.success) {
        setStudents(res.data.users);
      }
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClass]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/users', { ...formData, role: 'student' });
      if (res.data.success) {
        alert(`Student ${res.data.user.fullName} created successfully! (DS Number: ${res.data.user.dsNumber})`);
        setShowAddModal(false);
        setFormData({ fullName: '', email: '', class: 'SS 3A', gender: 'Male', dsNumber: '', password: 'Student@123' });
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student.');
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student '${name}'?`)) return;
    try {
      await API.delete(`/users/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Error deleting student.');
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPass = prompt(`Enter new password for ${name}:`, 'Student@123');
    if (!newPass) return;
    try {
      const res = await API.put(`/users/${id}/reset-password`, { newPassword: newPass });
      alert(res.data.message);
    } catch (err) {
      alert('Error resetting password.');
    }
  };

  const handleBulkImport = async () => {
    try {
      // Parse CSV text format: FullName, Email, Class, Gender, DSNumber
      const lines = bulkCsvText.split('\n');
      const parsedStudents = [];

      for (let line of lines) {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2 && parts[0] && parts[1]) {
          parsedStudents.push({
            fullName: parts[0],
            email: parts[1],
            class: parts[2] || 'SS 3A',
            gender: parts[3] || 'Male',
            dsNumber: parts[4] || undefined
          });
        }
      }

      if (parsedStudents.length === 0) {
        alert('No valid student rows detected in CSV text.');
        return;
      }

      const res = await API.post('/users/bulk-import', { students: parsedStudents });
      alert(res.data.message);
      setShowImportModal(false);
      setBulkCsvText('');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Bulk import failed.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-damale-gold-500" /> Student Directory Management
          </h1>
          <p className="text-xs text-slate-500">Manage registered students, DS numbers, class assignments & password resets.</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-navy text-xs py-2.5 px-3.5 border border-damale-navy-600 flex-1 sm:flex-initial"
          >
            <Upload className="w-4 h-4" /> Bulk CSV Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gold text-xs py-2.5 px-4 font-bold uppercase tracking-wider flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, DS Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="glass-input py-2 text-xs w-full sm:w-auto"
          >
            <option value="">All Classes</option>
            <option value="SS 3A">SS 3A</option>
            <option value="SS 3B">SS 3B</option>
            <option value="SS 2A">SS 2A</option>
            <option value="SS 1A">SS 1A</option>
            <option value="JSS 3A">JSS 3A</option>
          </select>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-w-full block">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-damale-navy-900 border-b border-slate-200 dark:border-damale-navy-700 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                <th className="p-4">DS Number</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-damale-navy-700/60 text-xs">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-100/50 dark:hover:bg-damale-navy-700/30 transition">
                    <td className="p-4 font-mono font-bold text-damale-gold-500 whitespace-nowrap">
                      {student.dsNumber || 'N/A'}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {student.fullName}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-damale-navy-700 text-slate-200 font-semibold">
                        {student.class || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">{student.gender}</td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">{student.email}</td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleResetPassword(student._id, student.fullName)}
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        title="Reset Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.fullName)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-damale-navy-800 border border-damale-navy-700 p-5 sm:p-6 max-w-md w-full space-y-4 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Register New Student</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amina Sani Katsina"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="glass-input py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="student@damale.edu.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 uppercase">Class</label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="glass-input py-2"
                    >
                      <option value="SS 3A">SS 3A</option>
                      <option value="SS 3B">SS 3B</option>
                      <option value="SS 2A">SS 2A</option>
                      <option value="SS 1A">SS 1A</option>
                      <option value="JSS 3A">JSS 3A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 uppercase">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="glass-input py-2"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase">
                    Custom DS Number (Optional - Auto generated if blank)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DSK/2026/005"
                    value={formData.dsNumber}
                    onChange={(e) => setFormData({ ...formData, dsNumber: e.target.value.toUpperCase() })}
                    className="glass-input py-2 font-mono uppercase"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary py-2 flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-gold py-2 flex-1 font-bold uppercase">
                    Save Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Bulk Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card bg-damale-navy-800 border border-damale-navy-700 p-6 max-w-lg w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-damale-navy-700 pb-3">
                <h3 className="font-bold text-lg text-white">Bulk CSV Student Import</h3>
                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Paste comma-separated rows in the format: <br />
                <code className="bg-slate-900 text-damale-gold-400 px-2 py-1 rounded block mt-1">
                  FullName, Email, Class, Gender, DSNumber
                </code>
              </p>

              <textarea
                rows="6"
                placeholder={`Amina Sani, amina@damale.edu.ng, SS 3A, Female, DSK/2026/010\nBello Farouk, bello@damale.edu.ng, SS 3A, Male, DSK/2026/011`}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                className="glass-input text-xs font-mono"
              />

              <div className="flex gap-3">
                <button onClick={() => setShowImportModal(false)} className="btn-secondary py-2 flex-1">
                  Cancel
                </button>
                <button onClick={handleBulkImport} className="btn-gold py-2 flex-1 font-bold uppercase">
                  Execute Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentManagement;
