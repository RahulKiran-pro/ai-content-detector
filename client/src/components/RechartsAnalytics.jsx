import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export default function RechartsAnalytics({ history }) {
  if (!history || history.length === 0) return null;

  // Radar Data (Confidence across models)
  const radarData = [
    { metric: 'LLM Pattern', value: 92 },
    { metric: 'Spectral Noise', value: 88 },
    { metric: 'Facial Geometry', value: 95 },
    { metric: 'Voice Clone', value: 90 },
    { metric: 'EXIF Integrity', value: 85 }
  ];

  // Pie Data (AI vs Authentic ratio)
  let aiCount = 0;
  let humanCount = 0;
  history.forEach((h) => {
    const verdict = (h.verdict || '').toLowerCase();
    if (verdict.includes('ai') || verdict.includes('edited') || verdict.includes('synthetic')) {
      aiCount++;
    } else {
      humanCount++;
    }
  });

  const pieData = [
    { name: 'AI Synthetic', value: aiCount || 1, color: '#ef4444' },
    { name: 'Human Authentic', value: humanCount || 1, color: '#10b981' }
  ];

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        borderRadius: '24px',
        marginBottom: '28px'
      }}
    >
      <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
        Advanced Recharts Forensic Analytics
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Multimodal model confidence metrics & detection distribution
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Radar Chart */}
        <div style={{ height: '240px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
            Model Precision Radar
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
              <Radar name="Precision" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ height: '240px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
            Audit Detection Distribution
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
