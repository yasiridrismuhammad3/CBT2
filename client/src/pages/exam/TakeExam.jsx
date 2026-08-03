import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react--[#0A192F]';
// import { useParams, useNavigate } from "react-router-dom";
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
  ListOrdered
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
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);

  const timerRef = useRef(null);

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
            try {
              setAnswers(JSON.parse(savedAnswers));
            } catch (e) { }
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

  // 2. Timer Countdown Effect
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
        // Save to localStorage every 5 seconds
        if (updated % 5 === 0) {
          localStorage.setItem(`cbt_timer_${user._id}_${examId}`, updated.toString());
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, exam, timeLeftSeconds]);

  // 3. Security Event Listeners (Prevent Copy/Paste, Right Click, Tab Switching warning, BeforeUnload)
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => {
      e.preventDefault();
      alert('⚠️ Copying content is disabled during CBT examination mode.');
    };
    const handlePaste = (e) => e.preventDefault();

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Warning: Leaving page will auto-submit your exam progress.';
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          alert(`⚠️ SECURITY WARNING (${next}/3): Tab switching or browser minimization is prohibited during CBT exam!`);
          return next;
        });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 4. Save answer handler
  const handleSelectOption = (questionId, optionKey) => {
    const newAnswers = { ...answers, [questionId]: optionKey };
    setAnswers(newAnswers);
    // Persist to local storage automatically
    localStorage.setItem(`cbt_answers_${user._id}_${examId}`, JSON.stringify(newAnswers));
  };

  // 5. Toggle Mark for Review
  const toggleMarkForReview = (questionId) => {
    if (markedForReview.includes(questionId)) {
      setMarkedForReview(markedForReview.filter((qId) => qId !== questionId));
    } else {
      setMarkedForReview([...markedForReview, questionId]);
    }
  };

  // 6. Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // 7. Auto submit when time expires
  const handleAutoSubmit = async () => {
    alert('⏱️ Time has expired! Your examination answers are being submitted automatically.');
    await submitExamPayload();
  };

  // 8. Manual submit payload function
  const submitExamPayload = async () => {
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

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col cbt-lock-user-select select-none">

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
              {exam.subject?.name} <span className="hidden sm:inline">• Student: {user?.fullName} ({user?.dsNumber})</span>
            </p>
          </div>
        </div>

        {/* Right: Timer & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

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
              <ListOrdered className="w-4 h-4 text-damale-gold-500" /> Question Palette Navigator
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
              <span className="text-slate-300 truncate">Unanswered ({totalQuestions - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500 flex-shrink-0"></div>
              <span className="text-slate-300 truncate">Marked ({markedForReview.length})</span>
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

          {/* Submit Mobile CTA */}
          <div className="pt-3 border-t border-damale-navy-700/60">
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
              className="glass-card bg-damale-navy-800 border border-damale-navy-700 p-8 max-w-md w-full text-center space-y-6"
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
