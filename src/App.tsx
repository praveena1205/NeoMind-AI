import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import AddPatientPage from './pages/patients/AddPatientPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import VideoAnalysisPage from './pages/analysis/VideoAnalysisPage';
import AudioAnalysisPage from './pages/analysis/AudioAnalysisPage';
import AIInsightsPage from './pages/insights/AIInsightsPage';
import ReportsPage from './pages/reports/ReportsPage';
import AdminPage from './pages/admin/AdminPage';
import SettingsPage from './pages/SettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
          </div>
          <p className="text-sm text-slate-400">Loading NeoMind...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        {/* Protected App Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
        <Route path="/patients/add" element={<ProtectedRoute><AddPatientPage /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
        <Route path="/video-analysis" element={<ProtectedRoute><VideoAnalysisPage /></ProtectedRoute>} />
        <Route path="/audio-analysis" element={<ProtectedRoute><AudioAnalysisPage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><AIInsightsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
