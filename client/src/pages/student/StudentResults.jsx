import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/results/student/history');
        if (res.data.success) setResults(res.data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-damale-gold-500" /> My Examination Results History
        </h1>
        <p className="text-xs text-slate-500">View past CBT test performance, scores, and downloadable result cards.</p>
      </div>

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((r) => (
            <div key={r._id} className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-damale-gold-500/20 text-damale-gold-400 font-bold text-[10px] uppercase">
                    {r.exam?.subject?.name || 'Subject'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Attempted: {new Date(r.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white mt-1">{r.exam?.title}</h3>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-lg font-black text-white">{r.score} / {r.totalMarks}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    r.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {r.percentage}% ({r.grade}) - {r.status}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/student/result/${r._id}`)}
                  className="btn-gold text-xs py-2 px-3 font-bold"
                >
                  View Sheet <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-8 text-center text-slate-400">
            No completed CBT results found in your account.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;
