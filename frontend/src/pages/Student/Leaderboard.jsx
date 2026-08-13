import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('leaderboard/')
      .then((res) => {
        setLeaderboardData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard data", err);
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Platform Leaderboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Top performing students ranked by average scores and completion rates.</p>
      </div>

      {leaderboardData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">No leaderboard rankings available yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="font-medium text-slate-600 px-6 py-3 w-16 text-center">Rank</th>
                  <th className="font-medium text-slate-600 px-6 py-3">Student Name</th>
                  <th className="font-medium text-slate-600 px-6 py-3">Average Score</th>
                  <th className="font-medium text-slate-600 px-6 py-3 text-right">Quizzes Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leaderboardData.map((entry, index) => {
                  const isTopThree = index < 3;
                  return (
                    <tr key={entry.student_name} className={`hover:bg-slate-50 transition-colors ${isTopThree ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold ${
                          index === 0 ? 'bg-blue-100 text-blue-700' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-amber-100 text-amber-800' :
                          'text-slate-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-medium text-xs text-slate-600">
                            {entry.student_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{entry.student_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{Math.round(entry.average_score)}%</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {entry.quizzes_completed}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}