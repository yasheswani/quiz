import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { username: 'Guest', role: 'STUDENT' };
  const isAdmin = user.role === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = isAdmin
    ? [
        { path: '/admin/dashboard', label: 'Admin Dashboard' },
        { path: '/admin/quizzes', label: 'Manage Quizzes' },
      ]
    : [
        { path: '/student/dashboard', label: 'Dashboard' },
        { path: '/student/quizzes', label: 'Quizzes' },
        { path: '/student/leaderboard', label: 'Leaderboard' },
      ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-indigo-200 shadow-md">
                Q
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">
                Quiz<span className="text-indigo-600">Flow</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-250 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/50 border border-slate-200/60 pl-3 pr-4 py-1.5 rounded-full shadow-sm">
                <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                  {user.username.charAt(0)}
                </div>
                <div className="text-left leading-none">
                  <span className="block text-xs font-bold text-slate-700">{user.username}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-slate-300 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-semibold rounded-xl transition duration-150"
              >
                Logout
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200/80 px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-base font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 pb-2 border-t border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">
                  {user.username.charAt(0)}
                </div>
                <div className="leading-tight">
                  <span className="block text-sm font-bold text-slate-800">{user.username}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} QuizFlow Platform. Built with modern React and Tailwind CSS.
      </footer>
    </div>
  );
}
