import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Mock Google OAuth ID token for demo/hackathon testing
      const demoName = prompt('Enter your name for Google OAuth:', 'Rahul Kiran');
      if (!demoName) {
        setLoading(false);
        return;
      }
      const demoEmail = `${demoName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      await signup(demoName, demoEmail, 'google_oauth_pass_2026');
      onClose();
    } catch (err) {
      setError(err.message || 'Google OAuth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
        borderRadius: '28px',
        border: '1px solid var(--glass-border-glow)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'var(--apple-accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900
            }}>
              TL
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                TruthLens AI Security Suite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="apple-glass-button"
            style={{ borderRadius: '50%', padding: '8px' }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--apple-accent-danger)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="Rahul Kiran"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '14px',
                    background: 'var(--bg-dropzone)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '14px',
                  background: 'var(--bg-dropzone)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '14px',
                  background: 'var(--bg-dropzone)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="apple-primary-button"
            style={{
              width: '100%',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.95rem'
            }}
          >
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : null}
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleDemoGoogleLogin}
          disabled={loading}
          className="apple-glass-button"
          style={{
            width: '100%',
            padding: '12px',
            justifyContent: 'center',
            fontSize: '0.9rem'
          }}
        >
          <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Mode Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            style={{ color: 'var(--apple-accent-blue)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
