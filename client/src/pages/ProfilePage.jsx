import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, Key } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', borderRadius: '14px', background: 'var(--apple-accent-gradient)', color: '#ffffff' }}>
            <User style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              User Account Profile
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manage personal details, active sessions, and enterprise credentials
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--apple-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.6rem', fontWeight: 900 }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{user?.name || 'Enterprise User'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email || 'user@truthlens.ai'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-dropzone)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Account Tier</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--apple-accent-blue)', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)' }}>Enterprise Unlimited</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-dropzone)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Security Protocol</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)' }}>JWT Bearer Token Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
