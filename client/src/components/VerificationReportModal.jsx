import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import { useToast } from './Toast';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Flag, 
  Sparkles,
  Info,
  Calendar,
  Cpu,
  FileText
} from 'lucide-react';

export default function VerificationReportModal({ report, resultData, contentType, onClose }) {
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportComments, setReportComments] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  if (!report) return null;

  const isAI = report.aiProbability >= 45;
  const themeColor = isAI ? '#ef4444' : '#10b981';
  const verificationUrl = `${window.location.origin}/verify/${report.verificationId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    showToast('Verification link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `TruthLens AI Verification Report - ${report.verificationId}`,
        text: `Content Verification Report: Verdict ${report.summaryVerdict} (AI Score: ${report.aiProbability}%)`,
        url: verificationUrl
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      await fetch(`${API_BASE_URL}/api/flagged/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: report.verificationId,
          reason: reportReason,
          comments: reportComments
        })
      });
      setReportSubmitted(true);
      showToast('Report submitted for investigation', 'success');
    } catch (err) {
      console.error('Report submission failed:', err);
      showToast('Report submission failed', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const downloadReportDocument = () => {
    const reportText = `
================================================================================
TRUTHLENS AI FORENSIC VERIFICATION REPORT
================================================================================
Verification ID:     ${report.verificationId}
Timestamp:           ${new Date(report.timestamp).toLocaleString()}
Content Type:        ${report.contentType || contentType || 'Multimodal'}
Summary Verdict:     ${report.summaryVerdict}
AI Probability:      ${report.aiProbability}%
Human Probability:   ${report.humanProbability}%

--------------------------------------------------------------------------------
DETECTION MODELS USED:
--------------------------------------------------------------------------------
${(report.modelsUsed || []).map((m, i) => `[${i + 1}] ${m}`).join('\n')}

--------------------------------------------------------------------------------
DETECTION REASONS & FORENSIC INDICATORS:
--------------------------------------------------------------------------------
${(report.detectionReasons || []).map((r, i) => `• ${r}`).join('\n')}

--------------------------------------------------------------------------------
METADATA ANALYSIS:
--------------------------------------------------------------------------------
Valid File Structure: ${report.metadataAnalysis?.isValid ? 'YES' : 'NO'}
Detection Step:       Stage ${report.metadataAnalysis?.detectionStep || 3}
Forensic Source:      ${report.metadataAnalysis?.source || 'TruthScan Synthetic Engine'}

================================================================================
Verification Link:   ${verificationUrl}
================================================================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRUTHLENS_REPORT_${report.verificationId}.txt`;
    link.click();
    showToast('Report document downloaded!', 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 8, 16, 0.88)',
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
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          border: `1.5px solid ${themeColor}`,
          padding: '28px'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--glass-border)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              {isAI ? (
                <ShieldAlert style={{ width: 26, height: 26, color: '#ef4444' }} />
              ) : (
                <ShieldCheck style={{ width: 26, height: 26, color: '#10b981' }} />
              )}
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                TruthLens Forensic Verification Report
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Verification ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--apple-accent-blue)', fontWeight: 800 }}>{report.verificationId}</span>
            </p>
          </div>

          <button onClick={onClose} className="apple-glass-button" style={{ borderRadius: '50%', padding: '8px' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* VERDICT BANNER */}
        <div
          style={{
            padding: '20px',
            borderRadius: '18px',
            background: isAI ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${themeColor}`,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
              Summary Verdict
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: themeColor, marginTop: '2px' }}>
              {report.summaryVerdict}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>AI Probability Score</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: themeColor }}>
              {report.aiProbability}%
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}
        >
          <div className="glass-card" style={{ padding: '14px', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Content Type</div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>{report.contentType || contentType || 'Multimodal'}</div>
          </div>

          <div className="glass-card" style={{ padding: '14px', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Human Probability</div>
            <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem', marginTop: '2px' }}>{report.humanProbability}%</div>
          </div>

          <div className="glass-card" style={{ padding: '14px', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Timestamp</div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: '2px' }}>{new Date(report.timestamp).toLocaleString()}</div>
          </div>
        </div>

        {/* REASONS */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--apple-accent-blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: 18, height: 18 }} /> Detection Reasons & Forensic Indicators
          </h4>
          <div className="glass-card" style={{ padding: '16px', borderRadius: '16px' }}>
            <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {(report.detectionReasons || []).map((reason, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* MODELS */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--apple-accent-blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu style={{ width: 18, height: 18 }} /> Detection Engines & Models
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(report.modelsUsed || []).map((model, idx) => (
              <div key={idx} style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--apple-accent-blue)', fontSize: '0.8rem', fontWeight: 700 }}>
                {model}
              </div>
            ))}
          </div>
        </div>

        {/* REPORT FORM */}
        {!reportSubmitted ? (
          <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flag style={{ width: 16, height: 16, color: '#f59e0b' }} /> Report Inaccurate Result / Misuse
            </h4>
            <form onSubmit={handleSubmitReport}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Reason (e.g. False Positive / Deepfake Misuse)"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg-dropzone)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="apple-glass-button"
                  style={{ padding: '10px 18px', background: '#f59e0b', color: '#000', fontWeight: 800, fontSize: '0.85rem', border: 'none' }}
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.85rem', marginBottom: '24px', fontWeight: 700 }}>
            ✓ Feedback logged successfully for verification ID {report.verificationId}.
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={handleCopyLink} className="apple-glass-button" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            {copiedLink ? <Check style={{ width: 15, height: 15, color: '#10b981' }} /> : <Copy style={{ width: 15, height: 15 }} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
          </button>

          <button onClick={handleShareReport} className="apple-glass-button" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <Share2 style={{ width: 15, height: 15 }} /> Share Report
          </button>

          <button onClick={downloadReportDocument} className="apple-primary-button" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            <Download style={{ width: 15, height: 15 }} /> Download PDF / TXT
          </button>
        </div>
      </motion.div>
    </div>
  );
}
