import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    total_attempted: 0,
    passed: 0,
    failed: 0,
    average_score: 0,
    highest_score: 0
  });
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { username: 'Student' };

  useEffect(() => {
    API.get('attempts/')
      .then((res) => {
        const attempts = res.data;
        setRecentAttempts(attempts);
        
        if (attempts.length > 0) {
          const passedCount = attempts.filter(a => a.status === 'PASSED').length;
          const failedCount = attempts.filter(a => a.status === 'FAILED').length;
          const totalScore = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
          const maxScore = Math.max(...attempts.map(a => a.percentage));

          setStats({
            total_attempted: attempts.length,
            passed: passedCount,
            failed: failedCount,
            average_score: Math.round(totalScore / attempts.length),
            highest_score: Math.round(maxScore)
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading dashboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user.username}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review your progress and latest quiz attempts.
        </p>
        <div className="mt-4">
          <Link
            to="/student/quizzes"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Browse All Quizzes
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Quizzes Attempted</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.total_attempted}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Average Score</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.average_score}%</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Passing Rate</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.total_attempted > 0 
              ? Math.round((stats.passed / stats.total_attempted) * 100) 
              : 0}%
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Highest Score</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.highest_score}%</p>
        </div>
      </div>

      {/* Recent Attempts History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-base font-semibold text-slate-800">Recent Quiz Attempts</h2>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">No quiz attempts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="font-medium text-slate-600 px-5 py-3">Quiz Title</th>
                  <th className="font-medium text-slate-600 px-5 py-3">Date Completed</th>
                  <th className="font-medium text-slate-600 px-5 py-3">Score</th>
                  <th className="font-medium text-slate-600 px-5 py-3">Status</th>
                  <th className="font-medium text-slate-600 px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-900 font-medium">
                      {attempt.quiz_title}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-slate-900">
                      {Math.round(attempt.percentage)}%
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        attempt.status === 'PASSED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.status === 'PASSED' ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link 
                        to={`/student/results/${attempt.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}