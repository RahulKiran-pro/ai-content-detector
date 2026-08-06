import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, ShieldAlert, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function FlaggedReportsPage() {
  const { showToast } = useToast();
  const [flaggedItems, setFlaggedItems] = useState([
    { id: 'FL-9021', date: '2026-08-06 14:20', type: 'IMAGE', score: 98, status: 'FLAGGED', reason: 'Midjourney v6 Deepfake Artifacts' },
    { id: 'FL-9022', date: '2026-08-06 11:05', type: 'TEXT', score: 86, status: 'REVIEWED', reason: 'ChatGPT Synthetic Pattern Match' },
    { id: 'FL-9023', date: '2026-08-05 18:40', type: 'AUDIO', score: 92, status: 'FLAGGED', reason: 'ElevenLabs Voice Clone' }
  ]);

  const handleDownloadReport = (item) => {
    showToast(`Downloading forensic report ${item.id}`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Flag style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Flagged Reports & Watermarked Logs
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Audit logs of high-risk synthetic media and reported misuses
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {flaggedItems.map((item) => (
          <div
            key={item.id}
            className="glass-card"
            style={{
              padding: '20px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <ShieldAlert style={{ width: 22, height: 22, color: '#ef4444' }} />
              <div>
                <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  {item.id} • {item.type}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.reason} • {item.date}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '6px 14px', borderRadius: '9999px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 800, fontSize: '0.82rem' }}>
                AI Risk: {item.score}%
              </div>

              <button onClick={() => handleDownloadReport(item)} className="apple-glass-button" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <Download style={{ width: 14, height: 14 }} /> Report TXT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
