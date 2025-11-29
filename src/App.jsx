import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import useAuthStore from './store/authStore';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Teachers = lazy(() => import('./pages/admin/Teachers').then(module => ({ default: module.Teachers })));
const Students = lazy(() => import('./pages/admin/Students').then(module => ({ default: module.Students })));
const Schedules = lazy(() => import('./pages/admin/Schedules').then(module => ({ default: module.Schedules })));
const Attendance = lazy(() => import('./pages/admin/Attendance').then(module => ({ default: module.Attendance })));
const Library = lazy(() => import('./pages/admin/Library').then(module => ({ default: module.Library })));
const Departments = lazy(() => import('./pages/admin/Departments').then(module => ({ default: module.Departments })));
const LessonMaterials = lazy(() => import('./pages/admin/LessonMaterials').then(module => ({ default: module.LessonMaterials })));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs').then(module => ({ default: module.AuditLogs })));
const Settings = lazy(() => import('./pages/admin/Settings').then(module => ({ default: module.Settings })));
const TeacherSettings = lazy(() => import('./pages/teacher/TeacherSettings').then(module => ({ default: module.TeacherSettings })));
const Quizzes = lazy(() => import('./pages/student/Quizzes').then(module => ({ default: module.Quizzes })));
const TakeQuiz = lazy(() => import('./pages/student/TakeQuiz').then(module => ({ default: module.TakeQuiz })));
const StudentSettings = lazy(() => import('./pages/student/StudentSettings').then(module => ({ default: module.StudentSettings })));

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner size="lg" />
            </div>
          }>
          <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <Teachers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Students />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Schedules />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Attendance />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Library />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Departments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson-materials"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <LessonMaterials />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AuditLogs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TeacherSettings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Test/quiz marshrutlari olib tashlandi */}
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardLayout>
                <StudentSettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;