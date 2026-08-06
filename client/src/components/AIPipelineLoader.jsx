import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Cpu, ShieldCheck, Zap, Sparkles, Loader2 } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, label: 'Uploading Content Payload', desc: 'Securely streaming file chunks to analysis buffer' },
  { id: 2, label: 'Extracting Media Metadata', desc: 'Analyzing EXIF, MIME attributes, compression & hashes' },
  { id: 3, label: 'Running AI Neural Models', desc: 'Querying TruthScan synthetic classification engines' },
  { id: 4, label: 'Deepfake & Artifact Analysis', desc: 'Detecting spectral frequency anomalies & facial artifacts' },
  { id: 5, label: 'Pattern Recognition Matrix', desc: 'Cross-referencing generative LLM & diffusion signatures' },
  { id: 6, label: 'Authenticity Verification Check', desc: 'Calculating confidence intervals & risk tier thresholds' },
  { id: 7, label: 'Generating Forensic Audit Report', desc: 'Assembling cryptographic report & watermark tokens' }
];

export default function AIPipelineLoader({ currentStep = 0, isFinished = false }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targetProgress = Math.min(100, Math.round(((currentStep + 1) / PIPELINE_STEPS.length) * 100));
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [currentStep]);

  const estimatedSeconds = Math.max(0, Math.ceil((100 - progress) / 12));

  return (
    <div
      className="glass-card"
      style={{
        padding: '28px',
        borderRadius: '24px',
        marginTop: '24px',
        background: 'var(--bg-glass-hover)',
        border: '1px solid var(--glass-border-glow)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Scanning Laser Line Effect */}
      <motion.div
        animate={{ y: [0, 300, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)',
          boxShadow: '0 0 15px #38bdf8',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      {/* Pipeline Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--apple-accent-blue)' }}>
            <Cpu style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Live AI Detection Pipeline
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              TruthScan Multi-Model Forensic Matrix Active
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--apple-accent-blue)' }}>
            {progress}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ~{estimatedSeconds}s remaining
          </div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', marginBottom: '24px' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{
            height: '100%',
            borderRadius: '9999px',
            background: 'var(--apple-accent-gradient)',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)'
          }}
        />
      </div>

      {/* 7-Step Pipeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = idx < currentStep || isFinished;
          const isCurrent = idx === currentStep && !isFinished;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '14px',
                background: isCurrent ? 'rgba(56, 189, 248, 0.1)' : isDone ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                border: `1px solid ${isCurrent ? 'var(--apple-accent-blue)' : isDone ? 'rgba(16, 185, 129, 0.2)' : 'transparent'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isDone ? (
                  <CheckCircle2 style={{ width: 18, height: 18, color: '#10b981' }} />
                ) : isCurrent ? (
                  <Loader2 style={{ width: 18, height: 18, animation: 'spin 1.2s linear infinite', color: '#38bdf8' }} />
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid var(--glass-border)' }} />
                )}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: isCurrent ? 800 : isDone ? 700 : 500, color: isDone ? '#10b981' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    Step {step.id}: {step.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {step.desc}
                  </div>
                </div>
              </div>

              {isCurrent && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.2)' }}>
                  Processing
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
