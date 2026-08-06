import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import TextDetectionPage from './pages/TextDetectionPage';
import ImageDetectionPage from './pages/ImageDetectionPage';
import PdfDetectionPage from './pages/PdfDetectionPage';
import AudioDetectionPage from './pages/AudioDetectionPage';
import VideoDetectionPage from './pages/VideoDetectionPage';
import DetectionHistoryPage from './pages/DetectionHistoryPage';
import FlaggedReportsPage from './pages/FlaggedReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LandingPage from './components/LandingPage';
import GlobalLoader from './components/GlobalLoader';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AnimatePresence } from 'framer-motion';

function LandingPageWrapper({ onOpenAuth }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading } = useAuth();

  // Auto-redirect authenticated users from Landing Page to Dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (searchParams.get('action') === 'login' || searchParams.get('action') === 'register') {
      onOpenAuth();
    }
  }, [searchParams, onOpenAuth]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      onOpenAuth();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>
      <LandingPage onGetStarted={handleGetStarted} />
    </div>
  );
}

function AppContent() {
  const [showGlobalLoader, setShowGlobalLoader] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {/* Global Splash Loader */}
      <AnimatePresence>
        {showGlobalLoader && (
          <GlobalLoader onComplete={() => setShowGlobalLoader(false)} />
        )}
      </AnimatePresence>

      <Routes>
        {/* Landing Page Route */}
        <Route
          path="/"
          element={<LandingPageWrapper onOpenAuth={() => setShowAuthModal(true)} />}
        />

        {/* Password Reset Route */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard Nested Routes (Guarded via ProtectedRoute) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="text" element={<TextDetectionPage />} />
          <Route path="image" element={<ImageDetectionPage />} />
          <Route path="pdf" element={<PdfDetectionPage />} />
          <Route path="audio" element={<AudioDetectionPage />} />
          <Route path="video" element={<VideoDetectionPage />} />
          <Route path="history" element={<DetectionHistoryPage />} />
          <Route path="flagged" element={<FlaggedReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
