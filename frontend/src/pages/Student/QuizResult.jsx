import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';

export default function QuizResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`attempts/${id}/`)
      .then((res) => setResult(res.data))
      .catch((err) => {
        console.error("Error fetching results", err);
        setError('Failed to retrieve quiz details. Make sure you are authorized.');
      });
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl font-semibold">
          {error}
        </div>
        <div className="mt-6 text-center">
          <Link to="/student/dashboard" className="text-indigo-600 hover:text-indigo-800 font-bold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const isPassed = result.status === 'PASSED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Quiz Result Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm mb-8 relative">
        <div className="mb-6 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Quiz Results</h1>
            <p className="text-slate-500 text-sm mt-1">{result.quiz_title}</p>
          </div>
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isPassed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>
        
        {/* Score Breakdown Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Final Score</span>
            <span className="text-3xl font-semibold text-slate-900 mt-1 block">{Math.round(result.percentage)}%</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Correct</span>
            <span className="text-2xl font-semibold text-green-600 mt-1 block">{result.correct_answers}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Incorrect</span>
            <span className="text-2xl font-semibold text-red-600 mt-1 block">{result.incorrect_answers}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Skipped</span>
            <span className="text-2xl font-semibold text-slate-500 mt-1 block">{result.unanswered}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link 
            to="/student/dashboard" 
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/student/quizzes" 
            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Browse Quizzes
          </Link>
        </div>
      </div>

      {/* Detailed Question Review */}
      {result.answers && result.answers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-200 pb-4">Question Review</h2>
          
          <div className="space-y-8">
            {result.answers.map((answer, index) => {
              const hasAnswered = answer.selected_option_text !== null && answer.selected_option_text !== '';
              return (
                <div key={answer.id} className="pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    {/* Visual correctness indicator */}
                    <div className="mt-1">
                      {(!hasAnswered) ? (
                        <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          </svg>
                        </div>
                      ) : answer.is_correct ? (
                        <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <p className="text-sm font-medium text-slate-900 mb-4">
                        {index + 1}. {answer.question_text}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className={`p-3 rounded-md border ${
                          !hasAnswered 
                            ? 'bg-slate-50 border-slate-200 text-slate-600' 
                            : answer.is_correct 
                              ? 'bg-green-50 border-green-200 text-green-800' 
                              : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          <span className="font-semibold mr-2">Your Answer:</span>
                          <span>{hasAnswered ? answer.selected_option_text : 'Skipped'}</span>
                        </div>

                        {!answer.is_correct && (
                          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800">
                            <span className="font-semibold mr-2">Correct Answer:</span>
                            <span>{answer.correct_option_text || 'Not provided'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}