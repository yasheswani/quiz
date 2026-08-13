import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';

export default function QuizDetail() {
  const { id } = useParams(); // Extracts the dynamic ID from the URL route
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Requests: http://127.0.0.1:8000/api/quizzes/{id}/
    API.get(`quizzes/${id}/`)
      .then((res) => {
        setQuiz(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching quiz details:", err);
        setError("Could not load this quiz. It may have been deleted.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-medium text-lg">Loading quiz details...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-red-500 font-semibold mb-4">{error || "Quiz not found."}</p>
        <Link to="/student/quizzes" className="text-indigo-600 hover:underline font-medium">
          &larr; Back to Available Quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/student/quizzes" className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-6 inline-flex items-center transition-colors">
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Quizzes
      </Link>
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
              {quiz.category_name || 'General'}
            </span>
            <span className="text-sm font-medium text-slate-500">
              Passing Score: {quiz.passing_score}%
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-2">{quiz.title}</h1>
          <p className="text-slate-600 text-sm leading-relaxed">{quiz.description}</p>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quiz Preview ({quiz.questions?.length || 0} Questions)</h2>
          
          {quiz.questions?.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No questions have been added to this quiz yet.</p>
          ) : (
            <div className="space-y-6">
              {quiz.questions?.map((q, index) => (
                <div key={q.id} className="pt-2">
                  <p className="font-medium text-slate-900 mb-3 text-sm">{index + 1}. {q.text}</p>
                  <ul className="space-y-2">
                    {q.options?.map((opt) => (
                      <li key={opt.id} className="text-sm bg-slate-50 px-4 py-2.5 rounded-md border border-slate-200 text-slate-700">
                        {opt.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}