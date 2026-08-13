import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    API.get(`quizzes/${id}/`)
      .then((res) => setQuiz(res.data))
      .catch((err) => console.error("Error fetching quiz", err));
  }, [id]);

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formattedAnswers = Object.keys(selectedAnswers).map(questionId => ({
      question: parseInt(questionId),
      selected_option: selectedAnswers[questionId]
    }));

    API.post('attempts/', {
      quiz: parseInt(id),
      answers: formattedAnswers
    })
    .then((res) => {
      setResult(res.data);
      setSubmitting(false);
    })
    .catch((err) => {
      console.error("Submission failed", err);
      alert("Failed to submit quiz. Ensure you are logged in.");
      setSubmitting(false);
    });
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Quiz Completed! 🎉</h1>
        <p className="text-slate-500 mb-6">Here is how you performed on <span className="font-semibold text-slate-800">{quiz?.title}</span></p>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 inline-block w-full">
          <div className="text-4xl font-black text-indigo-600 mb-1">{result.percentage}%</div>
          <p className="text-sm text-slate-500 font-medium">Final Score: {result.score} points</p>
        </div>

        <div className="flex justify-center gap-4">
          <Link to="/student/quizzes" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) return <div className="text-center py-20 text-slate-500">Loading quiz...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">{quiz.title}</h1>
        <p className="text-slate-600 text-sm">{quiz.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {quiz.questions?.map((question, index) => (
          <div key={question.id} className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm">
            <p className="font-medium text-slate-900 text-base mb-4">
              <span className="text-slate-500 mr-2">{index + 1}.</span>
              {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label 
                  key={option.id} 
                  className={`flex items-start p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedAnswers[question.id] === option.id 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center h-5 mt-0.5">
                    <input 
                      type="radio" 
                      name={`question-${question.id}`} 
                      checked={selectedAnswers[question.id] === option.id}
                      onChange={() => handleOptionSelect(question.id, option.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-slate-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className={`block ${selectedAnswers[question.id] === option.id ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                      {option.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={submitting}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}