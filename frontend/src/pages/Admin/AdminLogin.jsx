import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginRes = await API.post('auth/login/admin/', { username, password });
      const { token, refresh, user } = loginRes.data;
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Invalid admin credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 sm:p-10 shadow-sm relative z-10">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Admin Portal
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to access the administrator dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-md">
            {error}
          </div>
        )}

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
              placeholder="admin"
            />
          </div>

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
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center shadow-sm"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In as Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
