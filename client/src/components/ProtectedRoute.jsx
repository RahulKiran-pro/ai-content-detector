import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <Loader2
          style={{
            width: 36,
            height: 36,
            color: 'var(--apple-accent-blue)',
            animation: 'spin 1s linear infinite',
            marginBottom: 16
          }}
        />
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Verifying Security Credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
