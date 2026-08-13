import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/Admin/AdminLogin';
import Layout from './components/Layout';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import QuizManagement from './pages/Admin/QuizManagement';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import QuizList from './pages/Student/QuizList';
import QuizAttempt from './pages/Student/QuizAttempt';
import QuizResult from './pages/Student/QuizResult';
import Leaderboard from './pages/Student/Leaderboard';

// Protected Route Guard
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('access_token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) {
    // If we're trying to access an admin route, redirect to admin login
    return <Navigate to={allowedRole === 'ADMIN' ? "/admin/login" : "/login"} replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (allowedRole && user.role !== allowedRole) {
      return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }
  } catch (e) {
    return <Navigate to={allowedRole === 'ADMIN' ? "/admin/login" : "/login"} replace />;
  }

  return <Layout>{children}</Layout>;
}

// Redirect based on current auth state
function HomeRedirect() {
  const token = localStorage.getItem('access_token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<HomeRedirect />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/quizzes" 
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <QuizManagement />
            </ProtectedRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/quizzes" 
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <QuizList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/quiz/:id" 
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <QuizAttempt />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/results/:id" 
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <QuizResult />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/leaderboard" 
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Leaderboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;