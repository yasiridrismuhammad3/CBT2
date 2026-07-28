import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/auth/StudentLogin';
import TeacherLogin from './pages/auth/TeacherLogin';
import AdminLogin from './pages/auth/AdminLogin';

import MainDashboardRouter from './pages/dashboards/MainDashboardRouter';
import TakeExam from './pages/exam/TakeExam';
import ExamResultView from './pages/exam/ExamResultView';

import StudentManagement from './pages/management/StudentManagement';
import TeacherManagement from './pages/management/TeacherManagement';
import SubjectManagement from './pages/management/SubjectManagement';
import QuestionBank from './pages/management/QuestionBank';
import ExamBuilder from './pages/management/ExamBuilder';
import ResultsAndAnalytics from './pages/management/ResultsAndAnalytics';
import Announcements from './pages/management/Announcements';

import AvailableExams from './pages/student/AvailableExams';
import StudentResults from './pages/student/StudentResults';
import StudentProfile from './pages/student/StudentProfile';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-damale-navy-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/student" element={<StudentLogin />} />
          <Route path="/auth/teacher" element={<TeacherLogin />} />
          <Route path="/auth/admin" element={<AdminLogin />} />

          {/* Full-Screen CBT Examination Engine Route (No App Shell navbar to prevent distraction) */}
          <Route
            path="/exam/:id/take"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TakeExam />
              </ProtectedRoute>
            }
          />

          {/* Protected Portal Dashboard Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<MainDashboardRouter />} />
                    <Route path="/student/result/:id" element={<ExamResultView />} />
                    
                    {/* Management Routes */}
                    <Route path="/management/students" element={<StudentManagement />} />
                    <Route path="/management/teachers" element={<TeacherManagement />} />
                    <Route path="/management/subjects" element={<SubjectManagement />} />
                    <Route path="/management/questions" element={<QuestionBank />} />
                    <Route path="/management/exams" element={<ExamBuilder />} />
                    <Route path="/management/exams/create" element={<ExamBuilder />} />
                    <Route path="/management/results" element={<ResultsAndAnalytics />} />
                    <Route path="/management/announcements" element={<Announcements />} />

                    {/* Student Routes */}
                    <Route path="/student/exams" element={<AvailableExams />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    <Route path="/student/profile" element={<StudentProfile />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
