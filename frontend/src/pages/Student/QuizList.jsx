import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('quizzes/')
      .then((res) => {
        console.log("Fetched quizzes API response:", res.data);
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        
        // Filter out duplicate IDs
        const uniqueQuizzes = Array.from(
          new Map(data.map(quiz => [quiz.id, quiz])).values()
        );
        setQuizzes(uniqueQuizzes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading available quizzes", err);
        setLoading(false);
      });
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const titleMatch = quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const categoryMatch = quiz.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return titleMatch || categoryMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Available Quizzes</h1>
          <p className="text-slate-500 mt-1 text-sm">Select a topic below to test your understanding.</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search quizzes or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
          />
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">No quizzes found matching your search.</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                    {quiz.category_name || 'General'}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {quiz.difficulty || 'All Levels'}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  {quiz.title}
                </h2>
                
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {quiz.description || 'No description provided for this quiz.'}
                </p>
                
                <div className="flex gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <div>
                    <span className="block text-xs text-slate-500">Duration</span>
                    <span className="font-medium text-slate-900">{quiz.duration || 10} Mins</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Passing Score</span>
                    <span className="font-medium text-slate-900">{quiz.passing_score || 50}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50/50 p-4 rounded-b-lg">
                <Link 
                  to={`/student/quiz/${quiz.id}`} 
                  className="block w-full text-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}