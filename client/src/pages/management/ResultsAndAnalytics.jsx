import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Award, Printer, Download, FileSpreadsheet, Search } from 'lucide-react';

const ResultsAndAnalytics = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.get('/exams');
        if (res.data.success) {
          setExams(res.data.exams);
          if (res.data.exams.length > 0) {
            setSelectedExamId(res.data.exams[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    const fetchResults = async () => {
      try {
        const res = await API.get(`/results/exam/${selectedExamId}`);
        if (res.data.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchResults();
  }, [selectedExamId]);

  const selectedExam = exams.find((e) => e._id === selectedExamId);

  // Export Excel Spreadsheet (.xlsx)
  const exportExcel = () => {
    if (results.length === 0) return;

    const data = results.map((r, idx) => ({
      'Position': idx + 1,
      'DS Number': r.student?.dsNumber || 'N/A',
      'Student Name': r.student?.fullName || 'N/A',
      'Class': r.student?.class || 'N/A',
      'Score': r.score,
      'Total Marks': r.totalMarks,
      'Percentage (%)': r.percentage,
      'Grade': r.grade,
      'Status': r.status,
      'Time Taken (s)': r.timeTakenSeconds
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Results');
    XLSX.writeFile(workbook, `DAMALE_CBT_Result_${selectedExam?.title || 'Exam'}.xlsx`);
  };

  // Export Class Summary PDF
  const exportPDF = () => {
    if (results.length === 0) return;
    const doc = new jsPDF();

    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('DAMALE SCHOOL KATSINA', 105, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text(`CLASS EXAMINATION MARKSHEET: ${selectedExam?.title || ''}`, 105, 26, { align: 'center' });

    const tableData = results.map((r, idx) => [
      idx + 1,
      r.student?.dsNumber || 'N/A',
      r.student?.fullName || 'N/A',
      r.student?.class || 'N/A',
      `${r.score}/${r.totalMarks}`,
      `${r.percentage}%`,
      r.grade,
      r.status
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Pos', 'DS Number', 'Student Name', 'Class', 'Score', '%', 'Grade', 'Status']],
      body: tableData,
      headStyles: { fillColor: [10, 25, 47], textColor: [245, 158, 11] },
      styles: { fontSize: 8 }
    });

    doc.save(`DAMALE_CBT_Marksheet_${selectedExam?.title || 'Exam'}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 sm:w-7 sm:h-7 text-damale-gold-500" /> CBT Class Marksheets & Reports
          </h1>
          <p className="text-xs text-slate-500">View student score rankings, pass/fail analytics, and export PDF/Excel reports.</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={exportExcel} className="btn-navy text-xs py-2.5 px-3.5 border border-damale-navy-600 flex-1 sm:flex-initial">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Excel
          </button>
          <button onClick={exportPDF} className="btn-gold text-xs py-2.5 px-4 font-bold uppercase flex-1 sm:flex-initial">
            <Printer className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Select Exam Dropdown */}
      <div className="glass-card p-4">
        <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Select CBT Examination</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="glass-input py-2.5 font-bold"
        >
          {exams.map((e) => (
            <option key={e._id} value={e._id}>{e.title} ({e.subject?.name})</option>
          ))}
        </select>
      </div>

      {/* Marksheet Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-w-full block">
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-damale-navy-900 border-b border-slate-200 dark:border-damale-navy-700 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                <th className="p-4">Position</th>
                <th className="p-4">DS Number</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">Score</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-damale-navy-700/60">
            {results.length > 0 ? (
              results.map((r, idx) => (
                <tr key={r._id} className="hover:bg-slate-100/50 dark:hover:bg-damale-navy-700/30">
                  <td className="p-4 font-bold text-damale-gold-400">#{idx + 1}</td>
                  <td className="p-4 font-mono">{r.student?.dsNumber || 'N/A'}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{r.student?.fullName || 'Student'}</td>
                  <td className="p-4">{r.student?.class || 'N/A'}</td>
                  <td className="p-4 font-bold">{r.score} / {r.totalMarks}</td>
                  <td className="p-4 font-bold text-damale-gold-400">{r.percentage}%</td>
                  <td className="p-4 font-bold">{r.grade}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      r.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400">
                  No submissions recorded for this examination yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsAndAnalytics;
