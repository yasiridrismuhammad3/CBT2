import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Clock, PlayCircle, Award, CheckCircle2, ArrowRight } from 'lucide-react';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.get('/exams/available');
        if (res.data.success) {
          setExams(res.data.exams);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-7 h-7 text-damale-gold-500" /> Available CBT Examinations
        </h1>
        <p className="text-xs text-slate-500">List of active CBT exams configured for your current class level.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div key={exam._id} className="glass-card p-6 space-y-4 flex flex-col justify-between hover:border-damale-gold-400/50 transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-damale-navy-700 text-damale-gold-400">
                  {exam.subject?.name}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  exam.isTaken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {exam.isTaken ? 'Completed' : 'Ready'}
                </span>
              </div>
              <h3 className="font-bold text-lg text-white">{exam.title}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>Duration: {exam.durationMinutes} Mins</span>
                <span>•</span>
                <span>Pass Mark: {exam.passPercentage}%</span>
              </p>
            </div>

            <div className="pt-2">
              {exam.isTaken ? (
                <button
                  onClick={() => navigate(`/student/result/${exam.resultId}`)}
                  className="btn-secondary w-full text-xs py-2.5"
                >
                  View Result Card ({exam.percentage}%)
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/exam/${exam._id}/take`)}
                  className="btn-gold w-full text-xs py-3 font-bold uppercase tracking-wider"
                >
                  Launch CBT Exam Now <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableExams;
