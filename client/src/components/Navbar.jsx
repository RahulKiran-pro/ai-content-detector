import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Sun, Moon, Clock, LogOut, Menu, X, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, onOpenAuthModal, onOpenHistory }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  // Check API health status periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/detect/credits/text`, { method: 'HEAD' });
        setApiOnline(res.ok || res.status < 500);
      } catch (err) {
        setApiOnline(false);
      }
    };
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        margin: '0 auto',
        width: 'calc(100% - 32px)',
        maxWidth: '1280px'
      }}
    >
      <div
        className="glass-card"
        style={{
          borderRadius: '24px',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)'
        }}
      >
        {/* Brand Logo & API Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'var(--apple-accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#ffffff',
              fontSize: '1.25rem',
              boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4), var(--glass-highlight)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer'
            }}
          >
            TL
          </motion.div>

          <div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              TruthLens <span style={{ color: 'var(--apple-accent-blue)' }}>AI</span>
              <div
                title={apiOnline ? 'TruthScan API Engine Online' : 'API Service Unavailable'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: apiOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: apiOnline ? '#10b981' : '#ef4444',
                  border: `1px solid ${apiOnline ? '#10b981' : '#ef4444'}`
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: apiOnline ? '#10b981' : '#ef4444',
                    boxShadow: apiOnline ? '0 0 8px #10b981' : 'none'
                  }}
                />
                {apiOnline ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Enterprise Authenticity & Deepfake Suite
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="desktop-only">
          {isAuthenticated ? (
            <>
              <button onClick={onOpenHistory} className="apple-glass-button">
                <Clock style={{ width: 16, height: 16, color: 'var(--apple-accent-blue)' }} />
                <span>Audit History</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 14px 4px 6px',
                  borderRadius: '9999px',
                  background: 'var(--bg-glass-hover)',
                  border: '1px solid var(--glass-border)'
                }}
              >
                <div
                  style={{
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
                  }}
                >
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
            <button onClick={onOpenAuthModal} className="apple-primary-button">
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="apple-glass-button"
            style={{ borderRadius: '9999px', padding: '8px 14px' }}
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

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="apple-glass-button mobile-toggle-btn"
          style={{ padding: '8px 12px', borderRadius: '12px', display: 'none' }}
        >
          {mobileMenuOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card"
            style={{
              marginTop: '8px',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { onOpenHistory(); setMobileMenuOpen(false); }}
                  className="apple-glass-button"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Clock style={{ width: 16, height: 16, color: 'var(--apple-accent-blue)' }} />
                  <span>Audit History</span>
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: 'var(--bg-glass-hover)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--apple-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user?.name || user?.email}</div>
                  </div>

                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="apple-glass-button"
                    style={{ padding: '6px 12px' }}
                  >
                    <LogOut style={{ width: 14, height: 14 }} /> Log Out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
                className="apple-primary-button"
                style={{ width: '100%' }}
              >
                Sign In / Register
              </button>
            )}

            <button
              onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
              className="apple-glass-button"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {theme === 'dark' ? <Sun style={{ width: 16, height: 16, color: '#f59e0b' }} /> : <Moon style={{ width: 16, height: 16, color: '#6366f1' }} />}
              <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-toggle-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
