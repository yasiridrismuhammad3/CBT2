import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  AlertTriangle,
  Maximize2,
  Minimize2,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ListOrdered,
  Eye,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TakeExam = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State: { questionId: "A" | "B" | "C" | "D" }
  const [answers, setAnswers] = useState({});
  // State: Array of questionIds marked for review
  const [markedForReview, setMarkedForReview] = useState([]);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [initialDurationSeconds, setInitialDurationSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Security tracking
  const [tabSwitchViolations, setTabSwitchViolations] = useState(0);
  const [fullscreenViolations, setFullscreenViolations] = useState(0);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [securityLockout, setSecurityLockout] = useState(false);
  const MAX_VIOLATIONS = 3;

  const timerRef = useRef(null);
  const violationsRef = useRef(0);

  // 1. Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await API.get(`/exams/${examId}/take`);
        if (res.data.success) {
          const examData = res.data.exam;
          setExam(examData);
          setQuestions(examData.questions || []);

          const totalSeconds = examData.durationMinutes * 60;
          setInitialDurationSeconds(totalSeconds);

          // Restore saved answers from localStorage if present
          const storageKey = `cbt_answers_${user._id}_${examId}`;
          const savedAnswers = localStorage.getItem(storageKey);
          if (savedAnswers) {
            try { setAnswers(JSON.parse(savedAnswers)); } catch (e) { }
          }

          // Restore saved timer if present
          const timerStorageKey = `cbt_timer_${user._id}_${examId}`;
          const savedTime = localStorage.getItem(timerStorageKey);
          if (savedTime && !isNaN(Number(savedTime)) && Number(savedTime) > 0) {
            setTimeLeftSeconds(Number(savedTime));
          } else {
            setTimeLeftSeconds(totalSeconds);
          }
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to load CBT Examination.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // 2. Force fullscreen on exam load
  useEffect(() => {
    if (!loading && exam) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    }
  }, [loading, exam]);

  // 3. Timer Countdown Effect
  useEffect(() => {
    if (loading || !exam || timeLeftSeconds <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        const updated = prev - 1;
        if (updated % 5 === 0) {
          localStorage.setItem(`cbt_timer_${user._id}_${examId}`, updated.toString());
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, exam, timeLeftSeconds]);

  // 4. Security: record a violation and possibly auto-submit
  const recordViolation = useCallback((type) => {
    violationsRef.current += 1;
    const total = violationsRef.current;
    const remaining = MAX_VIOLATIONS - total;

    if (total >= MAX_VIOLATIONS) {
      setSecurityLockout(true);
      setViolationMessage(`⛔ FINAL VIOLATION: Auto-submitting your exam due to ${MAX_VIOLATIONS} security breaches.`);
      setShowViolationAlert(true);
      setTimeout(() => {
        submitExamPayload();
      }, 3000);
    } else {
      setViolationMessage(`⚠️ SECURITY VIOLATION (${total}/${MAX_VIOLATIONS}): ${type}. ${remaining} warning(s) remaining before auto-submit.`);
      setShowViolationAlert(true);
      if (type === 'Tab Switch' || type === 'Fullscreen Exit') {
        if (type === 'Tab Switch') setTabSwitchViolations(total);
        if (type === 'Fullscreen Exit') setFullscreenViolations((v) => v + 1);
      }
      setTimeout(() => setShowViolationAlert(false), 5000);
    }
  }, []);

  // 5. Security Event Listeners
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => { e.preventDefault(); };
    const handlePaste = (e) => e.preventDefault();
    const handleCut = (e) => e.preventDefault();

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Warning: Leaving page will auto-submit your exam progress.';
    };

    const handleVisibilityChange = () => {
      if (document.hidden) recordViolation('Tab Switch');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        recordViolation('Fullscreen Exit');
        // Re-request fullscreen after 2 seconds
        setTimeout(() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
          }
        }, 2000);
      } else {
        setIsFullscreen(true);
      }
    };

    const handleKeyDown = (e) => {
      // Block DevTools shortcuts
      if (e.key === 'F12') { e.preventDefault(); recordViolation('DevTools Open Attempt'); }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) { e.preventDefault(); recordViolation('DevTools Open Attempt'); }
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); }
      // Block print
      if (e.ctrlKey && e.key === 'p') { e.preventDefault(); }
      // Block save page
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); }
      // Block new tab/window
      if (e.ctrlKey && (e.key === 't' || e.key === 'n')) { e.preventDefault(); recordViolation('New Tab/Window Attempt'); }
      // Block alt-tab / windows key
      if (e.altKey && e.key === 'Tab') { e.preventDefault(); }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('cut', handleCut);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [recordViolation]);

  // 6. Save answer handler
  const handleSelectOption = (questionId, optionKey) => {
    const newAnswers = { ...answers, [questionId]: optionKey };
    setAnswers(newAnswers);
    localStorage.setItem(`cbt_answers_${user._id}_${examId}`, JSON.stringify(newAnswers));
  };

  // 7. Toggle Mark for Review
  const toggleMarkForReview = (questionId) => {
    if (markedForReview.includes(questionId)) {
      setMarkedForReview(markedForReview.filter((qId) => qId !== questionId));
    } else {
      setMarkedForReview([...markedForReview, questionId]);
    }
  };

  // 8. Fullscreen toggle handler (manual)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // 9. Auto submit when time expires
  const handleAutoSubmit = async () => {
    await submitExamPayload();
  };

  // 10. Manual submit payload function
  const submitExamPayload = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const timeSpentSeconds = initialDurationSeconds - timeLeftSeconds;
      const res = await API.post('/results/submit', {
        examId,
        answers,
        timeTakenSeconds: timeSpentSeconds > 0 ? timeSpentSeconds : initialDurationSeconds
      });

      if (res.data.success) {
        // Clear local storage exam backup
        localStorage.removeItem(`cbt_answers_${user._id}_${examId}`);
        localStorage.removeItem(`cbt_timer_${user._id}_${examId}`);
        // Exit fullscreen before navigating
        if (document.fullscreenElement) {
          try { await document.exitFullscreen(); } catch (e) {}
        }
        navigate(`/student/result/${res.data.resultId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting examination. Please contact invigilator.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen bg-damale-navy-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-damale-gold-500 mx-auto flex items-center justify-center text-2xl font-black">
            DS
          </div>
          <h2 className="text-xl font-bold">Initializing CBT Examination Portal...</h2>
          <p className="text-xs text-slate-400">Loading questions, setting up security lock, and starting countdown timer.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const totalViolations = violationsRef.current;

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Student Name Watermark Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-white/[0.03] font-black uppercase text-2xl whitespace-nowrap rotate-[-30deg] select-none"
            style={{
              top: `${(i * 14) - 5}%`,
              left: `-10%`,
              width: '130%',
              letterSpacing: '0.15em'
            }}
          >
            {user?.fullName} • {user?.dsNumber} • DAMALE SCHOOL KATSINA CBT •
          </div>
        ))}
      </div>

      {/* Security Violation Alert Banner */}
      <AnimatePresence>
        {showViolationAlert && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 sm:px-8 py-3 flex items-center gap-3 shadow-2xl"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <p className="text-xs sm:text-sm font-bold flex-1">{violationMessage}</p>
            <button onClick={() => setShowViolationAlert(false)} className="p-1">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Lockout Overlay */}
      {securityLockout && (
        <div className="fixed inset-0 z-[100] bg-red-900/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <ShieldAlert className="w-16 h-16 text-red-300 mx-auto animate-pulse" />
            <h2 className="text-2xl font-black text-white">Exam Terminated</h2>
            <p className="text-red-200 text-sm">Multiple security violations detected. Your answers are being auto-submitted. The invigilator has been notified.</p>
            <div className="animate-pulse text-red-300 text-xs font-mono">SUBMITTING...</div>
          </div>
        </div>
      )}

      {/* CBT Top Invigilator Header Bar */}
      <header className="sticky top-0 z-40 bg-damale-navy-900/95 backdrop-blur-md border-b border-damale-navy-700 px-3 sm:px-8 py-3 flex items-center justify-between gap-2">

        {/* Left: Exam Title & Subject */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-damale-gold-500 to-amber-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow ring-2 ring-damale-gold-400 flex-shrink-0">
            CBT
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-xs sm:text-base text-white truncate max-w-[140px] xs:max-w-[220px] sm:max-w-md">
              {exam.title}
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold text-damale-gold-400 uppercase tracking-wider truncate">
              {exam.subject?.name} <span className="hidden sm:inline">• {user?.fullName} ({user?.dsNumber})</span>
            </p>
          </div>
        </div>

        {/* Right: Timer & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

          {/* Violation Badge */}
          {totalViolations > 0 && (
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-[10px] font-bold">
              <ShieldAlert className="w-3 h-3" />
              <span>{totalViolations}/{MAX_VIOLATIONS}</span>
            </div>
          )}

          {/* Live Timer Badge */}
          <div className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 border font-mono font-bold text-xs sm:text-base transition-colors ${timeLeftSeconds < 300
            ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
            : 'bg-damale-navy-800 text-damale-gold-400 border-damale-gold-500/30'
            }`}>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl bg-damale-navy-800 hover:bg-damale-navy-700 text-slate-300 transition"
            title="Toggle Fullscreen CBT Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-gold text-xs py-2 sm:py-2.5 px-3 sm:px-4 font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Submit</span>
          </button>
        </div>

      </header>

      {/* CBT Main Exam Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Left / Main Column: Question Viewer */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4 sm:space-y-6">

          {/* Question Header Status */}
          <div className="glass-card p-4 sm:p-6 bg-damale-navy-800/80 border border-damale-navy-700/80 space-y-4">

            <div className="flex items-center justify-between border-b border-damale-navy-700/60 pb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-damale-gold-500/20 text-damale-gold-400 border border-damale-gold-500/30">
                Question {currentIndex + 1} of {totalQuestions}
              </span>

              <button
                onClick={() => toggleMarkForReview(currentQ._id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition ${markedForReview.includes(currentQ._id)
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                  : 'bg-damale-navy-700/60 text-slate-400 hover:text-white'
                  }`}
              >
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {markedForReview.includes(currentQ._id) ? 'Marked' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Statement */}
            <div className="py-2">
              <h2 className="text-base sm:text-xl font-bold text-white leading-relaxed">
                {currentQ.questionText}
              </h2>

              {currentQ.questionImage && (
                <div className="mt-4 max-w-md">
                  <img
                    src={currentQ.questionImage}
                    alt="Question visual reference"
                    className="rounded-xl border border-damale-navy-700 shadow-md max-w-full h-auto"
                    draggable="false"
                  />
                </div>
              )}
            </div>

            {/* Answer Options List (A, B, C, D) */}
            <div className="space-y-2.5 sm:space-y-3 pt-2 sm:pt-4">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ._id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(currentQ._id, opt.key)}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 sm:gap-4 ${isSelected
                      ? 'bg-damale-gold-500/20 border-damale-gold-400 text-white shadow-lg shadow-amber-500/10 font-semibold ring-2 ring-damale-gold-400/40'
                      : 'bg-damale-navy-900/60 border-damale-navy-700 text-slate-300 hover:border-slate-500 hover:bg-damale-navy-700/40'
                      }`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs transition flex-shrink-0 ${isSelected
                      ? 'bg-damale-gold-500 text-white'
                      : 'bg-damale-navy-700 text-slate-400'
                      }`}>
                      {opt.key}
                    </div>
                    <span className="text-xs sm:text-base flex-1 break-words">{opt.text}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-damale-gold-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Navigation Controls Footer */}
          <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-secondary text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 w-full xs:w-auto disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Previous Question
            </button>

            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-gold text-xs sm:text-sm py-2.5 sm:py-3 px-6 sm:px-8 font-bold uppercase tracking-wider w-full xs:w-auto"
              >
                <Send className="w-4 h-4" /> Review & Submit
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="btn-gold text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 w-full xs:w-auto"
              >
                Next Question <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Question Palette & Overview */}
        <div className="glass-card p-4 sm:p-6 bg-damale-navy-800/80 border border-damale-navy-700/80 space-y-4 sm:space-y-6">

          <div className="border-b border-damale-navy-700/60 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-damale-gold-500" /> Question Palette
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Click any number to jump directly</p>
          </div>

          {/* Palette Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0"></div>
              <span className="text-slate-300 truncate">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-700 flex-shrink-0"></div>
              <span className="text-slate-300 truncate">Pending ({totalQuestions - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500 flex-shrink-0"></div>
              <span className="text-slate-300 truncate">Review ({markedForReview.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-damale-gold-400 flex-shrink-0"></div>
              <span className="text-slate-300 truncate">Current</span>
            </div>
          </div>

          {/* Question Grid Buttons */}
          <div className="grid grid-cols-5 xs:grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = !!answers[q._id];
              const isMarked = markedForReview.includes(q._id);

              let bgColor = 'bg-damale-navy-900 text-slate-400 border-damale-navy-700';
              if (isMarked) bgColor = 'bg-purple-600/60 text-white border-purple-400';
              else if (isAnswered) bgColor = 'bg-emerald-600 text-white border-emerald-500';

              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs border transition-all flex items-center justify-center ${bgColor} ${isCurrent ? 'ring-2 ring-damale-gold-400 scale-105 sm:scale-110 font-extrabold z-10' : 'hover:scale-105'
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Security Status */}
          <div className="pt-3 border-t border-damale-navy-700/60 space-y-2">
            <div className="flex items-center gap-2 text-[10px]">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400">Exam monitored — violations tracked</span>
            </div>
            {totalViolations > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-red-400">
                <ShieldAlert className="w-3 h-3" />
                <span>{totalViolations} violation(s) recorded</span>
              </div>
            )}
          </div>

          {/* Submit Mobile CTA */}
          <div className="pt-2 border-t border-damale-navy-700/60">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-gold w-full py-3 text-xs font-bold uppercase tracking-wider"
            >
              Finish & Submit Examination
            </button>
          </div>

        </div>

      </div>

      {/* Confirmation Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card bg-damale-navy-800 border border-damale-navy-700 p-6 sm:p-8 max-w-md w-full text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center ring-4 ring-amber-500/30">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Submit Examination?</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Are you sure you want to finish and submit your CBT answers? Once submitted, you cannot change your responses.
                </p>
              </div>

              <div className="bg-damale-navy-900/70 p-4 rounded-xl border border-damale-navy-700 text-xs space-y-2 text-left">
                <div className="flex justify-between text-slate-300">
                  <span>Total Questions:</span>
                  <strong className="text-white font-bold">{totalQuestions}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Answered:</span>
                  <strong className="text-emerald-400 font-bold">{answeredCount}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Unanswered:</span>
                  <strong className="text-amber-400 font-bold">{totalQuestions - answeredCount}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Marked for Review:</span>
                  <strong className="text-purple-400 font-bold">{markedForReview.length}</strong>
                </div>
                {totalViolations > 0 && (
                  <div className="flex justify-between text-slate-300 border-t border-damale-navy-700 pt-2">
                    <span>Security Violations:</span>
                    <strong className="text-red-400 font-bold">{totalViolations}</strong>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                  className="btn-secondary text-xs py-3 flex-1"
                >
                  Return to Exam
                </button>
                <button
                  onClick={submitExamPayload}
                  disabled={submitting}
                  className="btn-gold text-xs py-3 flex-1 uppercase tracking-wider font-bold"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TakeExam;
