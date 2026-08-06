import React, { useState } from 'react';
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
      await fetch('/api/flagged/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: report.verificationId,
          reason: reportReason,
          comments: reportComments
        })
      });
      setReportSubmitted(true);
    } catch (err) {
      console.error('Report submission failed:', err);
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
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '20px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: `1.5px solid ${themeColor}`,
        boxShadow: `0 20px 60px ${isAI ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.25)'}`,
        padding: '28px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {isAI ? (
                <ShieldAlert style={{ width: 24, height: 24, color: '#ef4444' }} />
              ) : (
                <ShieldCheck style={{ width: 24, height: 24, color: '#10b981' }} />
              )}
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                TruthLens Forensic Verification Report
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Verification ID: <span style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>{report.verificationId}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* VERDICT SUMMARY BANNER */}
        <div style={{
          padding: '20px',
          borderRadius: '14px',
          background: isAI ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${themeColor}`,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Summary Verdict
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: themeColor, marginTop: '2px' }}>
              {report.summaryVerdict}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>AI Probability Score</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: themeColor }}>
              {report.aiProbability}%
            </div>
          </div>
        </div>

        {/* METRICS & DETAILS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Content Type</div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem', marginTop: '2px' }}>{report.contentType || contentType || 'Multimodal'}</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Human Probability</div>
            <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem', marginTop: '2px' }}>{report.humanProbability}%</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Timestamp</div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', marginTop: '2px' }}>{new Date(report.timestamp).toLocaleString()}</div>
          </div>
        </div>

        {/* DETECTION REASONS */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: 18, height: 18 }} /> Detection Reasons & Forensic Analysis
          </h4>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {(report.detectionReasons || []).map((reason, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* MODELS USED */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu style={{ width: 18, height: 18 }} /> Detection Engines & Models
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(report.modelsUsed || []).map((model, idx) => (
              <div key={idx} style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600 }}>
                {model}
              </div>
            ))}
          </div>
        </div>

        {/* REPORT CONTENT MODAL FORM */}
        {!reportSubmitted ? (
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flag style={{ width: 16, height: 16, color: '#f59e0b' }} /> Report Inaccurate Result / Misuse
            </h4>
            <form onSubmit={handleSubmitReport}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Reason (e.g. False Positive / Deepfake Misuse)"
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#f59e0b', color: '#000', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '24px' }}>
            ✓ Feedback logged successfully for verification ID {report.verificationId}.
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCopyLink}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copiedLink ? <Check style={{ width: 15, height: 15, color: '#10b981' }} /> : <Copy style={{ width: 15, height: 15 }} />}
            {copiedLink ? 'Link Copied!' : 'Copy Verification Link'}
          </button>

          <button
            onClick={handleShareReport}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(129, 140, 248, 0.4)',
              color: '#a5b4fc',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Share2 style={{ width: 15, height: 15 }} /> Share Verification Report
          </button>

          <button
            onClick={downloadReportDocument}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download style={{ width: 15, height: 15 }} /> Download Report PDF/TXT
          </button>
        </div>
      </div>
    </div>
  );
}
