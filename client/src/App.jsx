import React, { useState, useEffect } from 'react';
import AIDetectionPanel from './components/AIDetectionPanel';
import AuthModal from './components/AuthModal';
import HistoryPage from './components/HistoryPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sun, Moon, ShieldCheck, User, LogOut, Clock, Key } from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('truthlens-theme') || 'dark';
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('truthlens-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Dynamic Aurora Mesh Animated Background */}
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      {/* Apple Liquid Glass Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        margin: '0 auto',
        width: 'calc(100% - 32px)',
        maxWidth: '1200px'
      }}>
        <div className="glass-card" style={{
          borderRadius: '24px',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: 'var(--apple-accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#ffffff',
              fontSize: '1.25rem',
              boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4), var(--glass-highlight)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              TL
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                TruthLens <span style={{ color: 'var(--apple-accent-blue)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Multimodal AI Authenticity Suite
              </div>
            </div>
          </div>

          {/* Controls & User Auth Session */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowHistoryPage(true)}
                  className="apple-glass-button"
                  style={{ borderRadius: '9999px', padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <Clock style={{ width: 15, height: 15, color: 'var(--apple-accent-blue)' }} />
                  <span>Audit History</span>
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px 4px 6px',
                  borderRadius: '9999px',
                  background: 'var(--bg-glass-hover)',
                  border: '1px solid var(--glass-border)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--apple-accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user?.name?.split(' ')[0] || user?.email}
                  </span>
                  <button
                    onClick={logout}
                    title="Log Out"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
                  >
                    <LogOut style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="apple-primary-button"
                style={{ borderRadius: '9999px', padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Sign In / Sign Up
              </button>
            )}

            {/* Apple Liquid Light/Dark Theme Switcher */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="apple-glass-button"
              style={{
                borderRadius: '9999px',
                padding: '8px 14px',
                fontSize: '0.85rem'
              }}
            >
              {theme === 'dark' ? (
                <>
                  <Sun style={{ width: 16, height: 16, color: '#f59e0b' }} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon style={{ width: 16, height: 16, color: '#6366f1' }} />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 16px', position: 'relative', zIndex: 10 }}>
        <AIDetectionPanel theme={theme} />
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '16px',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>TruthLens AI • Security & Authenticity Suite</div>
          <div>Powered by TruthScan Multi-Modal Detection Engines</div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* History Page Modal */}
      {showHistoryPage && (
        <HistoryPage onClose={() => setShowHistoryPage(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
