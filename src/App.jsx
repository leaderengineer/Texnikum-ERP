import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Login } from './pages/Login';
import useAuthStore from './store/authStore';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Teachers = lazy(() => import('./pages/admin/Teachers').then(module => ({ default: module.Teachers })));
const Students = lazy(() => import('./pages/admin/Students').then(module => ({ default: module.Students })));
const Groups = lazy(() => import('./pages/admin/Groups').then(module => ({ default: module.Groups })));
const Schedules = lazy(() => import('./pages/admin/Schedules').then(module => ({ default: module.Schedules })));
const Attendance = lazy(() => import('./pages/admin/Attendance').then(module => ({ default: module.Attendance })));
const Library = lazy(() => import('./pages/admin/Library').then(module => ({ default: module.Library })));
const Departments = lazy(() => import('./pages/admin/Departments').then(module => ({ default: module.Departments })));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs').then(module => ({ default: module.AuditLogs })));

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
            path="/groups"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <Groups />
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
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <Library />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <Departments />
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;