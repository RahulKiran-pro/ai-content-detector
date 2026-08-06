import React from 'react';
import { motion } from 'framer-motion';

export default function StatsChart({ history }) {
  if (!history || history.length === 0) return null;

  // Calculate statistics
  const typeCounts = { text: 0, image: 0, pdf: 0, audio: 0, video: 0 };
  let aiCount = 0;
  let humanCount = 0;

  history.forEach((item) => {
    const type = item.contentType || 'text';
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    const verdict = (item.verdict || '').toLowerCase();
    if (verdict.includes('ai') || verdict.includes('edited') || verdict.includes('synthetic')) {
      aiCount++;
    } else {
      humanCount++;
    }
  });

  const total = history.length;
  const categories = [
    { key: 'text', label: 'Text', count: typeCounts.text, color: '#38bdf8' },
    { key: 'image', label: 'Image', count: typeCounts.image, color: '#818cf8' },
    { key: 'pdf', label: 'PDF', count: typeCounts.pdf, color: '#10b981' },
    { key: 'audio', label: 'Audio', count: typeCounts.audio, color: '#f59e0b' },
    { key: 'video', label: 'Video', count: typeCounts.video, color: '#ec4899' }
  ];

  const maxCount = Math.max(...categories.map((c) => c.count), 1);
  const aiRatio = Math.round((aiCount / total) * 100);

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        borderRadius: '20px',
        marginBottom: '24px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Audit Analytics & Detection Ratio
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Distribution of multimodal authenticity scans
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 800
            }}
          >
            {aiRatio}% AI Generated
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.8rem',
              fontWeight: 800
            }}
          >
            {100 - aiRatio}% Authentic
          </div>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories.map((cat) => {
          const pct = Math.round((cat.count / maxCount) * 100);
          return (
            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '60px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)'
                }}
              >
                {cat.label}
              </span>

              <div
                style={{
                  flex: 1,
                  height: '12px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: cat.color,
                    boxShadow: `0 0 12px ${cat.color}80`
                  }}
                />
              </div>

              <span
                style={{
                  width: '32px',
                  textAlign: 'right',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)'
                }}
              >
                {cat.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
