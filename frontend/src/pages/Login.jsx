import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await API.post('auth/register/', { username, email, password });
      }
      
      const loginRes = await API.post('auth/login/student/', { username, password });
      const { token, refresh, user } = loginRes.data;
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/student/dashboard');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Something went wrong. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      
      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 sm:p-10 shadow-sm relative z-10">
        
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center shadow-sm mb-4">
            <span className="text-xl font-bold text-white">QF</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            QuizFlow
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister ? 'Create a student account' : 'Sign in to your student dashboard'}
          </p>
        </div>

        {/* Form Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-md mb-8">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`w-1/2 py-2 rounded text-sm font-medium transition ${
              !isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`w-1/2 py-2 rounded text-sm font-medium transition ${
              isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-md">
            {error}
          </div>
        )}

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
              placeholder="Enter your username"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center shadow-sm"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
