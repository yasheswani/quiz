import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    total_students: 0,
    total_quizzes: 0,
    published_quizzes: 0,
    total_attempts: 0,
    average_score: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('admin/analytics/')
      .then((res) => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin analytics", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 mb-6 shadow-sm">
        <div>
          <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
            Control Panel & Analytics
          </span>
          <h1 className="text-2xl font-semibold mt-3 text-slate-900">
            Platform Operations
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Overview of the assessment metrics, active assessments, and student performance metrics.
          </p>
        </div>
      </div>

      {/* Admin Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Students</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.total_students}</p>
        </div>
        
        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Quizzes</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.total_quizzes}</p>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Published Quizzes</p>
          <p className="text-3xl font-semibold text-blue-600 mt-2">{analytics.published_quizzes}</p>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Attempts</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.total_attempts}</p>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Average Score</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.average_score}%</p>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Platform Operations Overview</h2>
        <p className="text-slate-600 text-sm mb-6">
          Use the navigation links in the header to manage the assessment lifecycle. From the Quiz Management page, you can create quizzes, customize duration and difficulty metrics, build questions, define option structures, and publish items.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 p-5 rounded-md bg-white hover:bg-slate-50 transition">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Quiz Management</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create, update, and publish draft tests. You can add multiple choice questions, set point rewards, and configure correct answers.
            </p>
            <a 
              href="/admin/quizzes" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
            >
              Manage Quizzes &rarr;
            </a>
          </div>

          <div className="border border-slate-200 p-5 rounded-md bg-white hover:bg-slate-50 transition">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Leaderboard & Standings</h3>
            <p className="text-xs text-slate-500 mb-4">
              Review current rankings, average scoring metrics, and track user completions across the platform.
            </p>
            <a 
              href="/student/leaderboard" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
            >
              View Standings &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}