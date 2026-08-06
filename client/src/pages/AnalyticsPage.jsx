import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import RechartsAnalytics from '../components/RechartsAnalytics';
import StatsChart from '../components/StatsChart';
import { BarChart3, TrendingUp, Cpu, ShieldCheck } from 'lucide-react';

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--apple-accent-blue)' }}>
            <BarChart3 style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Deep Forensic Intelligence & Model Analytics
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Cross-model confidence distribution and accuracy metrics
            </p>
          </div>
        </div>
      </div>

      <RechartsAnalytics history={history.length > 0 ? history : [{ contentType: 'text', verdict: 'AI' }]} />
      <StatsChart history={history.length > 0 ? history : [{ contentType: 'text', verdict: 'AI' }]} />
    </div>
  );
}
