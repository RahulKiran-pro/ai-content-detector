import React, { useState } from 'react';
import { Settings, Key, Bell, Shield, Check } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('tl_live_908218492019481029481');
  const [copiedKey, setCopiedKey] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    showToast('API Key copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', borderRadius: '14px', background: 'rgba(129, 140, 248, 0.15)', color: 'var(--apple-accent-purple)' }}>
            <Settings style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              System & API Settings
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manage authentication keys, webhooks, and system preferences
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key style={{ width: 18, height: 18, color: 'var(--apple-accent-blue)' }} /> API Secret Key
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Use this secret key to authenticate REST & WebSocket requests from your backend server.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="password"
            readOnly
            value={apiKey}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'var(--bg-dropzone)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem'
            }}
          />
          <button onClick={copyApiKey} className="apple-primary-button" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>
            {copiedKey ? <Check style={{ width: 16, height: 16 }} /> : null}
            <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
