import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import RightSidebar from './RightSidebar';

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const mainPaddingLeft = sidebarCollapsed ? '78px' : '280px';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', transition: 'background-color 0.4s ease' }}>
      {/* Dynamic Aurora Mesh Backdrop */}
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      {/* Left Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        closeMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container Wrapper */}
      <div
        className="main-layout-wrapper"
        style={{
          paddingLeft: mainPaddingLeft,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          transition: 'padding-left 0.3s ease'
        }}
      >
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Content Area + Optional Right Sidebar */}
        <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 10 }}>
          {/* Main Route Content */}
          <main style={{ flex: 1, padding: '28px 24px', minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Right Desktop Sidebar */}
          <RightSidebar />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .main-layout-wrapper {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
