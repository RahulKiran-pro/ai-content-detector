import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Lightbulb, Activity, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RightSidebar() {
  const navigate = useNavigate();

  return (
    <aside
      className="desktop-only"
      style={{
        width: '300px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        flexShrink: 0
      }}
    >
      {/* Credits Card */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          borderRadius: '22px',
          background: 'var(--apple-liquid-gradient)',
          border: '1px solid var(--glass-border-glow)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Coins style={{ width: 20, height: 20, color: '#f59e0b' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Enterprise Credits
          </h4>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Unlimited multimodal scan quota active for high-throughput audits.
        </p>
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="apple-primary-button"
          style={{ width: '100%', padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <span>Manage API Plan</span>
          <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Detection Tips Card */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Lightbulb style={{ width: 20, height: 20, color: 'var(--apple-accent-blue)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Forensic Audit Tips
          </h4>
        </div>
        <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '6px' }}>PDF documents perform best under 2MB size.</li>
          <li style={{ marginBottom: '6px' }}>Images retain EXIF data for spectral noise checks.</li>
          <li>Audio clips analyze 40+ synthetic voice features.</li>
        </ul>
      </div>

      {/* Live System Status Card */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity style={{ width: 18, height: 18, color: '#10b981' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>API Health</span>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)' }}>
            99.9% Operational
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          TruthScan Neural Matrix v4.2 active with latency &lt;1.8s.
        </div>
      </div>
    </aside>
  );
}
