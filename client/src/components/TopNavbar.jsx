import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from './Toast';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Coins, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  CheckCircle2
} from 'lucide-react';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/dashboard/text': 'AI Text Detection',
  '/dashboard/image': 'Image Deepfake Detector',
  '/dashboard/pdf': 'PDF Forensic Audit',
  '/dashboard/audio': 'Synthetic Audio Detection',
  '/dashboard/video': 'Video Deepfake Analyzer',
  '/dashboard/history': 'Detection Audit History',
  '/dashboard/flagged': 'Flagged Reports',
  '/dashboard/analytics': 'Analytics & Intelligence',
  '/dashboard/settings': 'System Settings',
  '/dashboard/profile': 'User Profile'
};

export default function TopNavbar({ onOpenMobileSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Dashboard';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/dashboard/history');
      showToast(`Searching audit history for "${searchQuery}"`, 'info');
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'background 0.4s ease, border-color 0.4s ease'
      }}
    >
      {/* Left: Mobile Trigger & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onOpenMobileSidebar}
          className="apple-glass-button mobile-only"
          style={{ padding: '8px 12px', borderRadius: '12px' }}
        >
          <Menu style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>TruthLens AI</span>
          <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{currentTitle}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="desktop-search" style={{ position: 'relative', width: '320px' }}>
        <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Global Search (Ctrl+K)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            borderRadius: '9999px',
            background: 'var(--bg-dropzone)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
      </form>

      {/* Right: Controls & User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Credits Balance Pill */}
        <div
          title="Remaining Detection Credits"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'var(--bg-dropzone)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#f59e0b'
          }}
        >
          <Coins style={{ width: 15, height: 15 }} />
          <span>Unlimited Credits</span>
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="apple-glass-button"
            style={{ borderRadius: '50%', padding: '9px', position: 'relative' }}
          >
            <Bell style={{ width: 18, height: 18 }} />
            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="glass-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '320px',
                  padding: '16px',
                  borderRadius: '20px',
                  zIndex: 100000
                }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '12px' }}>System Notifications</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 style={{ width: 16, height: 16, color: '#10b981', flexShrink: 0 }} />
                    <div>TruthScan Neural Matrix v4.2 updated successfully.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle: Moon in Light Mode, Sun in Dark Mode */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="apple-glass-button"
          style={{ borderRadius: '50%', padding: '9px' }}
        >
          {theme === 'light' ? (
            <Moon style={{ width: 18, height: 18, color: '#6366f1' }} />
          ) : (
            <Sun style={{ width: 18, height: 18, color: '#f59e0b' }} />
          )}
        </button>

        {/* User Profile Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--apple-accent-gradient)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              color: '#fff',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </button>

          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="glass-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '220px',
                  padding: '12px',
                  borderRadius: '20px',
                  zIndex: 100000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--glass-border)', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{user?.name || 'Enterprise User'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>

                <button onClick={() => { navigate('/dashboard/profile'); setShowUserDropdown(false); }} className="apple-glass-button" style={{ border: 'none', background: 'transparent' }}>
                  <User style={{ width: 16, height: 16 }} /> Profile
                </button>

                <button onClick={() => { navigate('/dashboard/settings'); setShowUserDropdown(false); }} className="apple-glass-button" style={{ border: 'none', background: 'transparent' }}>
                  <Settings style={{ width: 16, height: 16 }} /> Settings
                </button>

                <button onClick={() => { logout(); setShowUserDropdown(false); }} className="apple-glass-button" style={{ border: 'none', background: 'transparent', color: '#ef4444' }}>
                  <LogOut style={{ width: 16, height: 16 }} /> Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .desktop-search { display: none !important; }
        }
      `}</style>
    </header>
  );
}
