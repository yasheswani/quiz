import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get(`quizzes/${id}/`)
      .then((res) => {
        setQuiz(res.data);
        setTimeLeft(res.data.duration * 60); // Convert minutes to seconds
      })
      .catch((err) => {
        console.error("Error fetching quiz details", err);
      });
  }, [id]);

  useEffect(() => {
    if (quiz && timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }
    if (!quiz) return;
    
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionId });
  };

  const handleSubmitQuiz = () => {
    if (submitting) return;
    setSubmitting(true);

    API.post(`quizzes/${id}/submit/`, { answers: selectedAnswers })
      .then((res) => {
        navigate(`/student/results/${res.data.attempt_id}`);
      })
      .catch((err) => {
        console.error("Submission failed", err);
        setSubmitting(false);
      });
  };

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header bar with timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{quiz.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {quiz.category_name || 'General'} • {quiz.difficulty || 'All Levels'}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
          timeLeft < 60 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden border border-slate-200">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 rounded-full" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-medium text-slate-500">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-slate-500">
            {Math.round(progressPercent)}% Complete
          </span>
        </div>

        <p className="text-lg font-medium text-slate-900 mb-6">
          {currentQuestion.question_text}
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option.id;
            return (
              <label 
                key={option.id} 
                className={`flex items-start p-4 border rounded-md cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center h-5 mt-0.5">
                  <input 
                    type="radio" 
                    name={`question-${currentQuestion.id}`} 
                    checked={isSelected}
                    onChange={() => handleOptionSelect(currentQuestion.id, option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-slate-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className={`block ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                    {option.option_text}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
          <button 
            disabled={currentQuestionIndex === 0} 
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-sm font-medium rounded-md transition-colors gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Previous
          </button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors gap-2"
            >
              Next
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}