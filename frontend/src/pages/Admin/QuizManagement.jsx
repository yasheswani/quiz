import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz Form states
  const [quizForm, setQuizForm] = useState({
    id: null,
    title: '',
    description: '',
    duration: 15,
    passing_score: 50,
    difficulty: 'Beginner',
    category_name: 'General',
    status: 'DRAFT'
  });
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);

  // Active quiz for nested management
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizDetail, setQuizDetail] = useState(null);

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');

  // Option state mapping: questionId -> newOptionText
  const [newOptionTexts, setNewOptionTexts] = useState({});
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState({});
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [editingOptionText, setEditingOptionText] = useState('');
  const [editingOptionIsCorrect, setEditingOptionIsCorrect] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = () => {
    setLoading(true);
    API.get('quizzes/')
      .then((res) => {
        setQuizzes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching quizzes", err);
        setLoading(false);
      });
  };

  const fetchQuizDetail = (quizId) => {
    API.get(`quizzes/${quizId}/`)
      .then((res) => {
        setQuizDetail(res.data);
      })
      .catch((err) => console.error("Error fetching quiz detail", err));
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    fetchQuizDetail(quiz.id);
  };

  const handleQuizFormSubmit = (e) => {
    e.preventDefault();
    const data = {
      title: quizForm.title,
      description: quizForm.description,
      duration: parseInt(quizForm.duration),
      passing_score: parseInt(quizForm.passing_score),
      difficulty: quizForm.difficulty,
      category_name: quizForm.category_name,
      status: quizForm.status
    };

    if (isEditingQuiz) {
      API.patch(`quizzes/${quizForm.id}/`, data)
        .then(() => {
          resetQuizForm();
          fetchQuizzes();
          if (selectedQuiz && selectedQuiz.id === quizForm.id) {
            fetchQuizDetail(quizForm.id);
          }
        })
        .catch((err) => console.error("Error editing quiz", err));
    } else {
      API.post('quizzes/', data)
        .then(() => {
          resetQuizForm();
          fetchQuizzes();
        })
        .catch((err) => console.error("Error creating quiz", err));
    }
  };

  const handleEditQuizClick = (quiz) => {
    setQuizForm({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration,
      passing_score: quiz.passing_score,
      difficulty: quiz.difficulty,
      category_name: quiz.category_name || 'General',
      status: quiz.status
    });
    setIsEditingQuiz(true);
    setShowQuizForm(true);
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz? All nested questions and option data will be deleted.")) {
      API.delete(`quizzes/${quizId}/`)
        .then(() => {
          fetchQuizzes();
          if (selectedQuiz && selectedQuiz.id === quizId) {
            setSelectedQuiz(null);
            setQuizDetail(null);
          }
        })
        .catch((err) => console.error("Error deleting quiz", err));
    }
  };

  const togglePublish = (quiz) => {
    const newStatus = quiz.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    API.patch(`quizzes/${quiz.id}/`, { status: newStatus })
      .then(() => {
        fetchQuizzes();
        if (selectedQuiz && selectedQuiz.id === quiz.id) {
          fetchQuizDetail(quiz.id);
        }
      })
      .catch((err) => console.error("Error toggling publish status", err));
  };

  const resetQuizForm = () => {
    setQuizForm({
      id: null,
      title: '',
      description: '',
      duration: 15,
      passing_score: 50,
      difficulty: 'Beginner',
      category_name: 'General',
      status: 'DRAFT'
    });
    setIsEditingQuiz(false);
    setShowQuizForm(false);
  };

  // --- Question CRUD Actions ---
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    API.post('questions/', {
      quiz: selectedQuiz.id,
      text: newQuestionText
    })
      .then(() => {
        setNewQuestionText('');
        fetchQuizDetail(selectedQuiz.id);
      })
      .catch((err) => console.error("Error adding question", err));
  };

  const handleStartEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditingQuestionText(question.text);
  };

  const handleSaveQuestionEdit = (questionId) => {
    if (!editingQuestionText.trim()) return;
    API.patch(`questions/${questionId}/`, {
      text: editingQuestionText
    })
      .then(() => {
        setEditingQuestionId(null);
        fetchQuizDetail(selectedQuiz.id);
      })
      .catch((err) => console.error("Error editing question", err));
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm("Delete this question?")) {
      API.delete(`questions/${questionId}/`)
        .then(() => {
          fetchQuizDetail(selectedQuiz.id);
        })
        .catch((err) => console.error("Error deleting question", err));
    }
  };

  // --- Option CRUD Actions ---
  const handleAddOption = (questionId) => {
    const text = newOptionTexts[questionId] || '';
    const isCorrect = newOptionIsCorrect[questionId] || false;
    if (!text.trim()) return;

    API.post('options/', {
      question: questionId,
      text: text,
      is_correct: isCorrect
    })
      .then(() => {
        setNewOptionTexts(prev => ({ ...prev, [questionId]: '' }));
        setNewOptionIsCorrect(prev => ({ ...prev, [questionId]: false }));
        fetchQuizDetail(selectedQuiz.id);
      })
      .catch((err) => console.error("Error adding option", err));
  };

  const handleStartEditOption = (option) => {
    setEditingOptionId(option.id);
    setEditingOptionText(option.text);
    setEditingOptionIsCorrect(option.is_correct);
  };

  const handleSaveOptionEdit = (optionId) => {
    if (!editingOptionText.trim()) return;
    API.patch(`options/${optionId}/`, {
      text: editingOptionText,
      is_correct: editingOptionIsCorrect
    })
      .then(() => {
        setEditingOptionId(null);
        fetchQuizDetail(selectedQuiz.id);
      })
      .catch((err) => console.error("Error saving option edit", err));
  };

  const handleDeleteOption = (optionId) => {
    if (window.confirm("Delete this option?")) {
      API.delete(`options/${optionId}/`)
        .then(() => {
          fetchQuizDetail(selectedQuiz.id);
        })
        .catch((err) => console.error("Error deleting option", err));
    }
  };

  // -------------------------------------------------------------
  // RENDER VIEWS
  // -------------------------------------------------------------

  if (selectedQuiz) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back and Header */}
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => { setSelectedQuiz(null); setQuizDetail(null); fetchQuizzes(); }}
            className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
          >
            &larr; Back to Quizzes
          </button>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Manage: {selectedQuiz.title}</h1>
              <p className="text-slate-500 text-sm mt-1">{selectedQuiz.description || 'No description provided'}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded ${selectedQuiz.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
              {selectedQuiz.status}
            </span>
          </div>
          <div className="text-sm text-slate-600 flex gap-4">
            <span><strong>Duration:</strong> {selectedQuiz.duration} min</span>
            <span><strong>Pass:</strong> {selectedQuiz.passing_score}%</span>
            <span><strong>Difficulty:</strong> {selectedQuiz.difficulty}</span>
          </div>
        </div>

        {/* Questions Manager */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 rounded-t-md">
            <h2 className="text-lg font-semibold text-slate-900">Questions & Options</h2>
          </div>
          
          <div className="p-6">
            {/* Add New Question */}
            <form onSubmit={handleAddQuestion} className="flex gap-2 mb-8">
              <input 
                type="text" required value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter a new question..."
                className="flex-grow border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
              >
                Add Question
              </button>
            </form>

            {/* Questions List */}
            {!quizDetail ? (
              <div className="text-center py-6">Loading questions...</div>
            ) : quizDetail.questions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-md">
                No questions yet. Add one above.
              </div>
            ) : (
              <div className="space-y-6">
                {quizDetail.questions.map((question, qIdx) => (
                  <div key={question.id} className="border border-slate-200 rounded-md p-5 bg-white">
                    {/* Question Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-grow">
                        {editingQuestionId === question.id ? (
                          <div className="flex gap-2 mr-4">
                            <input
                              type="text"
                              value={editingQuestionText}
                              onChange={(e) => setEditingQuestionText(e.target.value)}
                              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
                            />
                            <button onClick={() => handleSaveQuestionEdit(question.id)} className="text-blue-600 font-medium text-sm">Save</button>
                            <button onClick={() => setEditingQuestionId(null)} className="text-slate-500 text-sm">Cancel</button>
                          </div>
                        ) : (
                          <h3 className="font-semibold text-slate-900 flex gap-2">
                            <span className="text-slate-400">Q{qIdx + 1}.</span> {question.text}
                          </h3>
                        )}
                      </div>
                      <div className="flex gap-3 text-sm shrink-0">
                        <button onClick={() => handleStartEditQuestion(question)} className="text-slate-500 hover:text-blue-600">Edit</button>
                        <button onClick={() => handleDeleteQuestion(question.id)} className="text-slate-500 hover:text-red-600">Delete</button>
                      </div>
                    </div>

                    {/* Options List (Inline) */}
                    <div className="ml-6 space-y-2 border-l-2 border-slate-100 pl-4">
                      {question.options.length > 0 ? (
                        question.options.map((option) => (
                          <div key={option.id} className="flex items-center justify-between group py-1">
                            <div className="flex items-center gap-3 flex-grow">
                              {editingOptionId === option.id ? (
                                <div className="flex items-center gap-2 w-full max-w-lg">
                                  <input 
                                    type="checkbox" 
                                    checked={editingOptionIsCorrect}
                                    onChange={(e) => setEditingOptionIsCorrect(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <input 
                                    type="text"
                                    value={editingOptionText}
                                    onChange={(e) => setEditingOptionText(e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-sm flex-grow"
                                  />
                                  <button onClick={() => handleSaveOptionEdit(option.id)} className="text-blue-600 text-xs font-medium">Save</button>
                                  <button onClick={() => setEditingOptionId(null)} className="text-slate-500 text-xs">Cancel</button>
                                </div>
                              ) : (
                                <>
                                  <span className={`h-2 w-2 rounded-full ${option.is_correct ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                  <span className={`text-sm ${option.is_correct ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                    {option.text} {option.is_correct && <span className="text-green-600 text-xs ml-1">(Correct)</span>}
                                  </span>
                                </>
                              )}
                            </div>
                            {editingOptionId !== option.id && (
                              <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                                <button onClick={() => handleStartEditOption(option)} className="text-slate-400 hover:text-blue-600 text-xs">Edit</button>
                                <button onClick={() => handleDeleteOption(option.id)} className="text-slate-400 hover:text-red-600 text-xs">Delete</button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No options defined.</p>
                      )}
                      
                      {/* Add Option Inline */}
                      <div className="mt-3 flex items-center gap-2 pt-2">
                        <input 
                          type="checkbox"
                          checked={newOptionIsCorrect[question.id] || false}
                          onChange={(e) => setNewOptionIsCorrect(prev => ({...prev, [question.id]: e.target.checked}))}
                          title="Mark as correct answer"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={newOptionTexts[question.id] || ''}
                          onChange={(e) => setNewOptionTexts(prev => ({...prev, [question.id]: e.target.value}))}
                          placeholder="Add new option..."
                          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button 
                          onClick={() => handleAddOption(question.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Quiz List
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Quiz Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Create, edit, and organize quizzes, questions, and choice options.</p>
        </div>
        <button
          onClick={() => { resetQuizForm(); setShowQuizForm(!showQuizForm); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition duration-150"
        >
          {showQuizForm ? 'Cancel New Quiz' : 'New Quiz'}
        </button>
      </div>

      {/* Quiz Form Collapse */}
      {showQuizForm && (
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 shadow-sm mb-8 max-w-3xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {isEditingQuiz ? 'Edit Quiz Details' : 'Create New Quiz'}
          </h2>
          
          <form onSubmit={handleQuizFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                type="text" required value={quizForm.title} 
                onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                placeholder="e.g. Introduction to Javascript" 
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                value={quizForm.description} 
                onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                placeholder="Describe what this quiz covers..." rows="3"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                <input 
                  type="number" required min="1" value={quizForm.duration} 
                  onChange={(e) => setQuizForm({...quizForm, duration: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passing Score (%)</label>
                <input 
                  type="number" required min="0" max="100" value={quizForm.passing_score} 
                  onChange={(e) => setQuizForm({...quizForm, passing_score: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                <select 
                  value={quizForm.difficulty} 
                  onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input 
                  type="text" value={quizForm.category_name} 
                  onChange={(e) => setQuizForm({...quizForm, category_name: e.target.value})}
                  placeholder="e.g. Frontend"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={quizForm.status} 
                  onChange={(e) => setQuizForm({...quizForm, status: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition duration-150"
              >
                {isEditingQuiz ? 'Save Updates' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid View */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Quiz Catalog</h2>
        </div>
        
        {loading && quizzes.length === 0 ? (
          <div className="text-center py-10">
            <span className="inline-block h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white">
            <p className="text-slate-500 text-sm">No quizzes found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="p-6 hover:bg-slate-50 transition duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-900">{quiz.title}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        quiz.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {quiz.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1 mb-2">{quiz.description || 'No description'}</p>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{quiz.category_name || 'General'}</span>
                      <span>{quiz.difficulty}</span>
                      <span>&bull;</span>
                      <span>{quiz.duration} mins</span>
                      <span>&bull;</span>
                      <span>Pass: {quiz.passing_score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePublish(quiz)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded transition"
                    >
                      {quiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleEditQuizClick(quiz)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded transition"
                    >
                      Edit Info
                    </button>
                    <button
                      onClick={() => handleSelectQuiz(quiz)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition"
                    >
                      Manage Questions
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition ml-1"
                      title="Delete quiz"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}