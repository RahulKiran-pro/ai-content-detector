import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  FileCheck, 
  Music, 
  Video as VideoIcon, 
  History, 
  Flag, 
  BarChart3, 
  Settings, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/text', label: 'Text Detection', icon: FileText, badge: 'AI Text' },
  { path: '/dashboard/image', label: 'Image Detection', icon: ImageIcon, badge: 'Deepfake' },
  { path: '/dashboard/pdf', label: 'PDF Detection', icon: FileCheck, badge: 'Audit' },
  { path: '/dashboard/audio', label: 'Audio Detection', icon: Music, badge: 'Voice' },
  { path: '/dashboard/video', label: 'Video Detection', icon: VideoIcon, badge: 'Video' },
  { path: '/dashboard/history', label: 'Detection History', icon: History },
  { path: '/dashboard/flagged', label: 'Flagged Reports', icon: Flag },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  { path: '/dashboard/profile', label: 'Profile', icon: User }
];

export default function Sidebar({ collapsed, toggleCollapse, mobileOpen, closeMobile }) {
  const { logout, user } = useAuth();
  const sidebarWidth = collapsed ? '78px' : '280px';

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            background: 'rgba(3, 7, 18, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        />
      )}

      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 99999,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          borderRight: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: collapsed ? '20px 10px' : '20px 16px',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
        className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Top Brand Header */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--glass-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
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
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
                  flexShrink: 0
                }}
              >
                TL
              </motion.div>

              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    TruthLens <span style={{ color: 'var(--apple-accent-blue)' }}>AI</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Enterprise SaaS Platform
                  </div>
                </motion.div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleCollapse}
              className="apple-glass-button desktop-only"
              style={{
                borderRadius: '50%',
                padding: '6px',
                width: '32px',
                height: '32px',
                justifyContent: 'center'
              }}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
            </button>

            {/* Mobile Close */}
            <button
              onClick={closeMobile}
              className="apple-glass-button mobile-only"
              style={{ borderRadius: '50%', padding: '6px', width: '32px', height: '32px', justifyContent: 'center' }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Navigation Links using NavLink */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={closeMobile}
                  style={{ textDecoration: 'none' }}
                >
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: collapsed ? 0 : 4 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        padding: collapsed ? '12px' : '12px 16px',
                        borderRadius: '16px',
                        background: isActive ? 'var(--apple-accent-gradient)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isActive ? '0 8px 25px rgba(2, 132, 199, 0.4), 0 0 15px rgba(56, 189, 248, 0.3)' : 'none'
                      }}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '20%',
                            bottom: '20%',
                            width: '4px',
                            borderRadius: '0 4px 4px 0',
                            background: '#ffffff'
                          }}
                        />
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon style={{ width: 20, height: 20, flexShrink: 0, color: isActive ? '#ffffff' : 'var(--apple-accent-blue)' }} />
                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-glass-hover)',
                            color: isActive ? '#ffffff' : 'var(--text-muted)'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Session Footer */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px' }}>
          {!collapsed && user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '16px',
                background: 'var(--bg-glass-hover)',
                marginBottom: '10px'
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--apple-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.name || 'Enterprise User'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="apple-glass-button"
            style={{
              width: '100%',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.3)'
            }}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            {!collapsed && <span>Log Out Session</span>}
          </button>
        </div>
      </motion.aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(-100%);
            width: 280px !important;
            transition: transform 0.3s ease;
          }
          .sidebar-container.mobile-open {
            transform: translateX(0);
          }
          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
