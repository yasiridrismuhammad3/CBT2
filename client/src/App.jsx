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
import AdminSecurityDashboard from './pages/dashboards/AdminSecurityDashboard';
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
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

          {/* Full-Screen CBT Examination Engine — student only */}
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
                    {/* Dashboard — role-based routing inside */}
                    <Route path="/dashboard" element={<MainDashboardRouter />} />

                    {/* Exam Result — student only */}
                    <Route
                      path="/student/result/:id"
                      element={
                        <ProtectedRoute allowedRoles={['student']}>
                          <ExamResultView />
                        </ProtectedRoute>
                      }
                    />

                    {/* ===== ADMIN-ONLY routes ===== */}
                    <Route
                      path="/management/students"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <StudentManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/teachers"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <TeacherManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/subjects"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <SubjectManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/security"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminSecurityDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* ===== ADMIN + TEACHER routes ===== */}
                    <Route
                      path="/management/questions"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                          <QuestionBank />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/exams"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                          <ExamBuilder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/exams/create"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                          <ExamBuilder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/results"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                          <ResultsAndAnalytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/management/announcements"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                          <Announcements />
                        </ProtectedRoute>
                      }
                    />

                    {/* ===== STUDENT-ONLY routes ===== */}
                    <Route
                      path="/student/exams"
                      element={
                        <ProtectedRoute allowedRoles={['student']}>
                          <AvailableExams />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/student/results"
                      element={
                        <ProtectedRoute allowedRoles={['student']}>
                          <StudentResults />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/student/profile"
                      element={
                        <ProtectedRoute allowedRoles={['student']}>
                          <StudentProfile />
                        </ProtectedRoute>
                      }
                    />

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
