import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import StatsChart from './StatsChart';
import RechartsAnalytics from './RechartsAnalytics';
import { exportHistoryToCSV } from '../utils/CSVExport';
import { useToast } from './Toast';
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
  Sparkles,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';

export default function HistoryPage({ onClose }) {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/history`, {
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

  const handleExportCSV = () => {
    exportHistoryToCSV(history);
    showToast('Audit history exported to CSV!', 'success');
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

  // Filter & Search Logic
  const filteredHistory = history.filter((item) => {
    const matchesType = filterType === 'all' || item.contentType === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      (item.inputSummary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.verdict || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item._id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          borderRadius: '28px',
          border: '1px solid var(--glass-border-glow)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: '1px solid var(--glass-border)',
            paddingBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--apple-accent-blue)' }}>
              <Clock style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                Forensic Audit History Dashboard
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Logging scans for {user?.name || user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {history.length > 0 && (
              <button onClick={handleExportCSV} className="apple-glass-button" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                <FileSpreadsheet style={{ width: 16, height: 16, color: '#10b981' }} />
                <span>Export CSV</span>
              </button>
            )}

            <button onClick={onClose} className="apple-glass-button" style={{ borderRadius: '50%', padding: '8px' }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 style={{ width: 36, height: 36, animation: 'spin 1.2s linear infinite', color: 'var(--apple-accent-blue)', margin: '0 auto 12px auto' }} />
            <div>Loading forensic history logs...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            {error}
          </div>
        ) : (
          <>
            {/* Visual Analytics Chart */}
            <RechartsAnalytics history={history} />
            <StatsChart history={history} />

            {/* Search & Filter Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by summary, ID, or verdict..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '16px',
                    background: 'var(--bg-dropzone)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Type Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all', 'text', 'image', 'pdf', 'audio', 'video'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border)',
                      background: filterType === type ? 'var(--apple-accent-gradient)' : 'var(--bg-dropzone)',
                      color: filterType === type ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit History List */}
            {filteredHistory.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShieldCheck style={{ width: 48, height: 48, margin: '0 auto 16px auto', opacity: 0.4 }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>No Scans Match Query</h4>
                <p style={{ fontSize: '0.88rem' }}>Try clearing your search query or switching content filters.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredHistory.map((scan) => {
                  const Icon = getIcon(scan.contentType);
                  const isAI = (scan.verdict || '').toLowerCase().includes('ai') || (scan.verdict || '').toLowerCase().includes('edited');

                  return (
                    <motion.div
                      key={scan._id}
                      onClick={() => setSelectedScan(scan)}
                      className="glass-card-interactive glass-card"
                      style={{
                        padding: '16px 20px',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            padding: '10px',
                            borderRadius: '14px',
                            background: 'var(--bg-glass-hover)',
                            color: 'var(--apple-accent-blue)'
                          }}
                        >
                          <Icon style={{ width: 20, height: 20 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {scan.inputSummary}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <Calendar style={{ width: 12, height: 12 }} />
                            {new Date(scan.createdAt).toLocaleString()} • {scan.contentType.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span
                          style={{
                            padding: '6px 14px',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            background: isAI ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            border: `1px solid ${isAI ? '#ef4444' : '#10b981'}`,
                            color: isAI ? '#ef4444' : '#10b981'
                          }}
                        >
                          {scan.verdict}
                        </span>
                        <ChevronRight style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Selected Scan Modal */}
        {selectedScan && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100000,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '28px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>Scan Detail Record</h3>
                <button onClick={() => setSelectedScan(null)} className="apple-glass-button" style={{ padding: '6px', borderRadius: '50%' }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <pre
                style={{
                  background: 'var(--bg-primary)',
                  padding: '16px',
                  borderRadius: '16px',
                  color: 'var(--apple-accent-blue)',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto'
                }}
              >
                {JSON.stringify(selectedScan, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
