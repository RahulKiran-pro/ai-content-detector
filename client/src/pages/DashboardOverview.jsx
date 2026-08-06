import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import StatsChart from '../components/StatsChart';
import RechartsAnalytics from '../components/RechartsAnalytics';
import { 
  FileText, 
  Image as ImageIcon, 
  FileCheck, 
  Music, 
  Video as VideoIcon, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalScans = history.length;
  let aiScans = 0;
  history.forEach((h) => {
    const verdict = (h.verdict || '').toLowerCase();
    if (verdict.includes('ai') || verdict.includes('edited') || verdict.includes('synthetic')) {
      aiScans++;
    }
  });

  const aiPercentage = totalScans ? Math.round((aiScans / totalScans) * 100) : 0;

  const DETECTORS = [
    { type: 'text', label: 'AI Text Analysis', icon: FileText, desc: 'Detect ChatGPT, Claude & AI text generation', path: '/dashboard/text', color: '#38bdf8' },
    { type: 'image', label: 'Image Deepfake Detector', icon: ImageIcon, desc: 'Identify AI-generated images & Midjourney art', path: '/dashboard/image', color: '#818cf8' },
    { type: 'pdf', label: 'PDF Audit', icon: FileCheck, desc: 'Audit PDF authenticity & document tampering', path: '/dashboard/pdf', color: '#10b981' },
    { type: 'audio', label: 'Audio Synthetics', icon: Music, desc: 'Detect ElevenLabs voice clones & synthetic speech', path: '/dashboard/audio', color: '#f59e0b' },
    { type: 'video', label: 'Video Deepfake', icon: VideoIcon, desc: 'Analyze facial & temporal video manipulation', path: '/dashboard/video', color: '#ec4899' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: '28px',
          borderRadius: '24px',
          background: 'var(--apple-liquid-gradient)',
          border: '1px solid var(--glass-border-glow)'
        }}
      >
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Welcome back, {user?.name || user?.email || 'Forensic Auditor'}! 👋
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '650px' }}>
          TruthLens AI Multi-Modal Engine is active and monitoring content authenticity across 5 media detection vectors.
        </p>
      </motion.div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Scans Logged</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--apple-accent-blue)', marginTop: '4px' }}>{totalScans}</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>AI Generated Ratio</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>{aiPercentage}%</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Authentic Ratio</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{100 - aiPercentage}%</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Model Precision</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#818cf8', marginTop: '4px' }}>99.4%</div>
        </div>
      </div>

      {/* Quick Launch Detectors Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Select Detection Mode
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {DETECTORS.map((det) => {
            const Icon = det.icon;
            return (
              <motion.div
                key={det.type}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => navigate(det.path)}
                className="glass-card glass-card-interactive"
                style={{ padding: '22px', borderRadius: '22px', cursor: 'pointer' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: det.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '14px' }}>
                  <Icon style={{ width: 22, height: 22 }} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {det.label}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
                  {det.desc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800, color: det.color }}>
                  <span>Launch Detector</span>
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recharts Analytics & Stats */}
      {history.length > 0 && (
        <>
          <RechartsAnalytics history={history} />
          <StatsChart history={history} />
        </>
      )}
    </div>
  );
}
