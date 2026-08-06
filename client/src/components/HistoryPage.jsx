import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronRight, 
  Loader2,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';

export default function HistoryPage({ onClose }) {
  const { token, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch history.');
      }
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || 'Could not load detection history.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'pdf': return FileCheck;
      case 'audio': return Music;
      case 'video': return VideoIcon;
      default: return FileText;
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
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        borderRadius: '28px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--apple-accent-blue)' }}>
              <Clock style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Detection Audit History
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Scoped scans for {user?.name || user?.email}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="apple-glass-button" style={{ borderRadius: '50%', padding: '8px' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 style={{ width: 36, height: 36, animation: 'spin 1.2s linear infinite', color: 'var(--apple-accent-blue)', margin: '0 auto 12px auto' }} />
            <div>Loading detection history...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--apple-accent-danger)' }}>
            {error}
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck style={{ width: 48, height: 48, margin: '0 auto 16px auto', opacity: 0.5 }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>No Past Scans Recorded</h4>
            <p style={{ fontSize: '0.9rem' }}>Run an AI detection scan to start logging your forensic audit history.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((scan) => {
              const Icon = getIcon(scan.contentType);
              const isAI = (scan.verdict || '').toLowerCase().includes('ai') || (scan.verdict || '').toLowerCase().includes('edited');

              return (
                <div
                  key={scan._id}
                  onClick={() => setSelectedScan(scan)}
                  className="glass-card-interactive"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'var(--bg-glass-hover)',
                      color: 'var(--apple-accent-blue)'
                    }}>
                      <Icon style={{ width: 20, height: 20 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {scan.inputSummary}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Calendar style={{ width: 12, height: 12 }} />
                        {new Date(scan.createdAt).toLocaleString()} • {scan.contentType.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      background: isAI ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${isAI ? '#ef4444' : '#10b981'}`,
                      color: isAI ? '#ef4444' : '#10b981'
                    }}>
                      {scan.verdict}
                    </span>
                    <ChevronRight style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Scan Detail Inspection Modal */}
        {selectedScan && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Scan Detail Inspection</h3>
                <button onClick={() => setSelectedScan(null)} className="apple-glass-button" style={{ padding: '6px', borderRadius: '50%' }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <pre style={{
                background: 'var(--bg-primary)',
                padding: '14px',
                borderRadius: '12px',
                color: 'var(--apple-accent-blue)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto'
              }}>
                {JSON.stringify(selectedScan, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
