import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileSpreadsheet,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const ExamResultView = () => {
  const { id: resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/results/${resultId}`);
        if (res.data.success) {
          const resData = res.data.result;
          setResult(resData);

          // Trigger celebratory confetti if student passed
          if (resData.status === 'Passed') {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch CBT result sheet.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  // Generate Official PDF Report Card
  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(10, 25, 47); // Damale Navy
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('DAMALE SCHOOL KATSINA', 105, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(245, 158, 11); // Gold accent
    doc.text('OFFICIAL CBT EXAMINATION RESULT REPORT', 105, 28, { align: 'center' });

    // Student & Exam Metadata Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Student Name: ${result.student?.fullName}`, 14, 50);
    doc.text(`DS Number: ${result.student?.dsNumber || 'N/A'}`, 14, 57);
    doc.text(`Class Level: ${result.student?.class || 'N/A'}`, 14, 64);

    doc.text(`Examination: ${result.exam?.title}`, 120, 50);
    doc.text(`Subject: ${result.exam?.subject?.name || 'N/A'}`, 120, 57);
    doc.text(`Date Attempted: ${new Date(result.submittedAt).toLocaleDateString()}`, 120, 64);

    // Performance Summary Line
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 72, 196, 72);

    doc.setFontSize(12);
    doc.text(`Score: ${result.score} / ${result.totalMarks}`, 14, 82);
    doc.text(`Percentage: ${result.percentage}%`, 70, 82);
    doc.text(`Grade: ${result.grade}`, 120, 82);
    doc.text(`Status: ${result.status}`, 160, 82);

    // Questions Breakdown Table
    const tableData = (result.answers || []).map((ans, i) => [
      i + 1,
      ans.question?.questionText ? ans.question.questionText.substring(0, 45) + '...' : 'Question',
      ans.selectedOption || 'Skipped',
      ans.question?.correctOption || 'N/A',
      ans.isCorrect ? 'Correct' : 'Incorrect',
      ans.marksObtained
    ]);

    doc.autoTable({
      startY: 90,
      head: [['#', 'Question Statement', 'Your Answer', 'Correct Key', 'Result', 'Marks']],
      body: tableData,
      headStyles: { fillColor: [10, 25, 47], textColor: [245, 158, 11] },
      styles: { fontSize: 8 }
    });

    // Save document
    doc.save(`CBT_Result_${result.student?.dsNumber || 'Student'}_${result.exam?.title}.pdf`);
  };

  if (loading || !result) {
    return (
      <div className="p-12 text-center text-slate-400 animate-pulse">
        Generating CBT Result Performance Breakdown...
      </div>
    );
  }

  const isPassed = result.status === 'Passed';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-xs transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </button>

      {/* Main Result Performance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-5 sm:p-8 border ${
          isPassed ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-rose-500/50 bg-rose-950/20'
        } relative overflow-hidden`}
      >
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-damale-gold-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> DAMALE SCHOOL KATSINA CBT
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white">
              {result.exam?.title}
            </h1>
            <p className="text-xs text-slate-300">
              Student: <strong className="text-white">{result.student?.fullName}</strong> ({result.student?.dsNumber}) • Class: {result.student?.class}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={exportPDF}
              className="btn-gold text-xs py-2.5 px-4 font-bold uppercase tracking-wider w-full md:w-auto"
            >
              <Printer className="w-4 h-4" /> Export Official PDF Report
            </button>
          </div>
        </div>

        {/* Score & Badge Showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-700/60 text-center">
          
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
            <h3 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {result.score} <span className="text-xs sm:text-sm font-semibold text-slate-400">/ {result.totalMarks}</span>
            </h3>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <p className="text-xs font-bold text-slate-400 uppercase">Percentage</p>
            <h3 className="text-2xl sm:text-3xl font-black mt-1 text-damale-gold-400">
              {result.percentage}%
            </h3>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <p className="text-xs font-bold text-slate-400 uppercase">Grade</p>
            <h3 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {result.grade}
            </h3>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
            <div className={`mt-1.5 inline-block px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase ${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {result.status}
            </div>
          </div>

        </div>

      </motion.div>

      {/* Detailed Question Review List */}
      <div className="glass-card p-6 space-y-6">
        <div className="border-b border-slate-700 pb-3">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-damale-gold-500" /> Detailed Questions Review
          </h3>
          <p className="text-xs text-slate-400">Review selected options, correct keys, and explanations</p>
        </div>

        <div className="space-y-4">
          {(result.answers || []).map((ans, index) => {
            const q = ans.question;
            if (!q) return null;

            return (
              <div
                key={index}
                className={`p-5 rounded-2xl border ${
                  ans.isCorrect
                    ? 'bg-emerald-950/10 border-emerald-500/30'
                    : 'bg-rose-950/10 border-rose-500/30'
                } space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-sm text-white">
                    Question {index + 1}: {q.questionText}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    ans.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {ans.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Your Answer:</span>
                    <span className={ans.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      Option {ans.selectedOption || 'Skipped'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Correct Answer:</span>
                    <span className="text-damale-gold-400 font-bold">
                      Option {q.correctOption}
                    </span>
                  </div>
                </div>

                {q.explanation && (
                  <div className="p-3 rounded-xl bg-damale-navy-900/80 border border-damale-navy-700 text-xs text-slate-300">
                    <strong className="text-damale-gold-400 font-bold">Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ExamResultView;
