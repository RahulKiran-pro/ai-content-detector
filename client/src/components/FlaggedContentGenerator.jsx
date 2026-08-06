import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';
import { API_BASE_URL } from '../config/api';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  Eye, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Share2, 
  Flag, 
  FileText, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Info,
  Calendar,
  Lock,
  Play,
  Pause
} from 'lucide-react';

export default function FlaggedContentGenerator({ 
  contentType = 'image', 
  originalFile = null, 
  originalUrl = '', 
  textContent = '', 
  verificationData = null, 
  report = null, 
  onClose = () => {},
  onOpenFullReport = () => {}
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('flagged'); // 'flagged' | 'original'
  const [flaggedImageUrl, setFlaggedImageUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportComments, setReportComments] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Score Calculations
  const aiScore = report?.aiProbability ?? (typeof verificationData?.result === 'number' ? (verificationData.result <= 1 ? Math.round(verificationData.result * 100) : Math.round(verificationData.result)) : 88);
  const humanScore = 100 - aiScore;
  const isAI = aiScore >= 45;
  const verificationId = report?.verificationId || `TL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const themeColor = isAI ? '#ef4444' : '#10b981';
  const watermarkText = isAI ? '⚠ AI GENERATED' : '⚠ VERIFIED AUTHENTIC';
  const verificationUrl = `${window.location.origin}/verify/${verificationId}`;

  // Image Canvas Watermark Generator
  useEffect(() => {
    if (contentType === 'image' || (originalFile && originalFile.type?.startsWith('image/'))) {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      if (originalFile) {
        img.src = URL.createObjectURL(originalFile);
      } else if (originalUrl) {
        img.src = originalUrl;
      } else {
        // Fallback demo image background
        img.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80';
      }

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = img.width || 800;
        const height = img.height || 600;

        const footerHeight = Math.max(80, Math.round(height * 0.13));
        canvas.width = width;
        canvas.height = height + footerHeight;

        // 1. Draw Original Image untouched
        ctx.drawImage(img, 0, 0, width, height);

        if (isAI) {
          // 2. Draw Diagonal Dark Crimson Banner Strip
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.rotate((-30 * Math.PI) / 180);

          const fontSize = Math.max(34, Math.round(width * 0.082));
          const stripHeight = fontSize * 1.65;

          // Backing Translucent Strip
          ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
          ctx.fillRect(-width * 1.5, -stripHeight / 2, width * 3, stripHeight);

          // Crimson Top & Bottom Lines
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = Math.max(3, Math.round(width * 0.005));
          ctx.beginPath();
          ctx.moveTo(-width * 1.5, -stripHeight / 2);
          ctx.lineTo(width * 1.5, -stripHeight / 2);
          ctx.moveTo(-width * 1.5, stripHeight / 2);
          ctx.lineTo(width * 1.5, stripHeight / 2);
          ctx.stroke();

          // Faint Repeating Background Audit Text above and below main text
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = `800 ${Math.max(10, Math.round(fontSize * 0.22))}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.letterSpacing = '1px';
          ctx.fillText('⚠ TRUTHLENS AI • SYNTHETIC MEDIA VERIFICATION AUDIT', 0, -stripHeight / 2 + 12);
          ctx.fillText('⚠ TRUTHLENS AI • SYNTHETIC MEDIA VERIFICATION AUDIT', 0, stripHeight / 2 - 6);

          // Main Bold Watermark Text with Black Outline Stroke
          ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.max(8, Math.round(width * 0.014));
          ctx.strokeText(watermarkText, 0, 0);

          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 16;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 5;

          ctx.fillStyle = '#ef4444';
          ctx.fillText(watermarkText, 0, 0);

          ctx.restore();

          // 3. Corner Badge Top-Right
          const badgeWidth = Math.max(150, Math.round(width * 0.22));
          const badgeHeight = Math.max(34, Math.round(height * 0.06));
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(width - badgeWidth - 15, 15, badgeWidth, badgeHeight, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = `800 ${Math.max(12, Math.round(badgeHeight * 0.4))}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`AI CONFIDENCE: ${aiScore}%`, width - (badgeWidth / 2) - 15, 15 + (badgeHeight / 2));
        }

        // 4. Draw Forensic Verification Footer Banner
        const footerY = height;
        ctx.fillStyle = 'rgba(11, 15, 25, 0.95)';
        ctx.fillRect(0, footerY, width, footerHeight);

        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, footerY);
        ctx.lineTo(width, footerY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${Math.max(13, Math.round(width * 0.022))}px system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`TruthLens AI Verification Report [ID: ${verificationId}]`, 18, footerY + 16);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `600 ${Math.max(11, Math.round(width * 0.017))}px system-ui, sans-serif`;
        ctx.fillText(`AI Score: ${aiScore}% | Human: ${humanScore}% | Verdict: ${isAI ? 'AI Generated Media' : 'Authentic Media'} | Date: ${new Date().toLocaleString()}`, 18, footerY + 44);

        try {
          const url = canvas.toDataURL('image/png');
          setFlaggedImageUrl(url);
        } catch (e) {
          console.warn('[Canvas Export Failed]', e);
        }
      };
    }
  }, [contentType, originalFile, originalUrl, isAI, aiScore, verificationId]);

  // Periodic Spoken Audio Warning (Every 12s during playback)
  useEffect(() => {
    let audioTimer = null;
    if ((contentType === 'audio' || contentType === 'video') && activeTab === 'flagged' && isAI && isPlayingAudio) {
      const speakWarning = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance("Warning. This media has been flagged as potentially AI generated by TruthLens AI.");
          msg.rate = 1.0;
          msg.volume = 0.6;
          window.speechSynthesis.speak(msg);
        }
      };

      speakWarning();
      audioTimer = setInterval(speakWarning, 12000);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (audioTimer) clearInterval(audioTimer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [contentType, activeTab, isAI, isPlayingAudio]);

  // Handle Downloads
  const downloadFlaggedCopy = () => {
    if (contentType === 'image' && flaggedImageUrl) {
      const link = document.createElement('a');
      link.href = flaggedImageUrl;
      link.download = `FLAGGED_TRUTHLENS_${originalFile?.name || 'image.png'}`;
      link.click();
      showToast('Flagged watermarked image downloaded', 'success');
    } else if (contentType === 'text') {
      const content = `================================================================================\nTRUTHLENS AI FLAGGED CONTENT COPY\n================================================================================\nVERDICT: ${isAI ? 'AI GENERATED SYNTHETIC TEXT' : 'AUTHENTIC HUMAN TEXT'}\nAI SCORE: ${aiScore}% | VERIFICATION ID: ${verificationId}\nTIMESTAMP: ${new Date().toLocaleString()}\n--------------------------------------------------------------------------------\n${textContent}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FLAGGED_TRUTHLENS_${verificationId}.txt`;
      link.click();
      showToast('Flagged text audit copy downloaded', 'success');
    } else {
      // PDF or Media Report download
      const content = `TRUTHLENS AI FLAGGED MEDIA AUDIT REPORT\nID: ${verificationId}\nType: ${contentType}\nAI Score: ${aiScore}%\nVerdict: ${isAI ? 'AI Generated / Synthetic Media' : 'Verified Authentic'}\nDate: ${new Date().toLocaleString()}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FLAGGED_AUDIT_REPORT_${verificationId}.txt`;
      link.click();
      showToast('Flagged forensic report copy downloaded', 'success');
    }
  };

  const downloadOriginalFile = () => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalFile.name;
      link.click();
      showToast('Untouched original file downloaded', 'success');
    } else if (originalUrl) {
      const link = document.createElement('a');
      link.href = originalUrl;
      link.download = `ORIGINAL_FILE_${verificationId}`;
      link.click();
      showToast('Untouched original file downloaded', 'success');
    } else if (textContent) {
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ORIGINAL_TEXT_${verificationId}.txt`;
      link.click();
      showToast('Untouched original text downloaded', 'success');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    showToast('Verification link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `TruthLens Verification Report ${verificationId}`,
        text: `Content Audit: ${isAI ? 'Likely AI Generated' : 'Authentic'} (${aiScore}% AI Probability)`,
        url: verificationUrl
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      await fetch(`${API_BASE_URL}/api/flagged/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          reason: reportReason,
          comments: reportComments
        })
      });
      setReportSubmitted(true);
      showToast('Feedback report submitted to security team', 'success');
    } catch (err) {
      showToast('Failed to submit report', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

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
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '28px',
          border: `1.5px solid ${themeColor}`,
          padding: '28px'
        }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                background: isAI ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                border: `1px solid ${themeColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeColor
              }}
            >
              <ShieldAlert style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                TruthLens Flagged Content Generator
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Original file remains <strong style={{ color: '#10b981' }}>100% unchanged</strong>. Separate watermarked copy generated for report audit.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="apple-glass-button" style={{ borderRadius: '50%', padding: '8px' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* View Switcher Tabs (Flagged Copy vs Untouched Original) */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '6px',
            borderRadius: '16px',
            background: 'var(--bg-dropzone)',
            border: '1px solid var(--glass-border)',
            marginBottom: '24px'
          }}
        >
          <button
            onClick={() => setActiveTab('flagged')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'flagged' ? (isAI ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--apple-accent-gradient)') : 'transparent',
              color: activeTab === 'flagged' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <AlertTriangle style={{ width: 16, height: 16 }} />
            <span>Flagged Copy</span>
          </button>

          <button
            onClick={() => setActiveTab('original')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'original' ? 'var(--apple-accent-gradient)' : 'transparent',
              color: activeTab === 'original' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Eye style={{ width: 16, height: 16 }} />
            <span>Untouched Original</span>
          </button>
        </div>

        {/* MEDIA PREVIEW DISPLAY AREA */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            background: '#070b14',
            border: `1.5px solid ${activeTab === 'flagged' ? themeColor : 'var(--glass-border)'}`,
            marginBottom: '24px',
            minHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Hidden Canvas for Image Export */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* IMAGE PREVIEW */}
          {contentType === 'image' && (
            <div style={{ width: '100%', textAlign: 'center', padding: '12px' }}>
              {activeTab === 'flagged' ? (
                flaggedImageUrl ? (
                  <img
                    src={flaggedImageUrl}
                    alt="Watermarked Flagged Copy"
                    style={{ maxWidth: '100%', maxHeight: '440px', borderRadius: '14px', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ padding: '60px', color: 'var(--text-muted)' }}>Generating high-visibility watermarked copy...</div>
                )
              ) : (
                <img
                  src={originalFile ? URL.createObjectURL(originalFile) : originalUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80'}
                  alt="Untouched Original"
                  style={{ maxWidth: '100%', maxHeight: '440px', borderRadius: '14px', objectFit: 'contain' }}
                />
              )}
            </div>
          )}

          {/* VIDEO PREVIEW */}
          {contentType === 'video' && (
            <div style={{ width: '100%', position: 'relative' }}>
              {/* Warning Banner during playback */}
              {activeTab === 'flagged' && isAI && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    background: 'rgba(239, 68, 68, 0.92)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertTriangle style={{ width: 16, height: 16 }} />
                  <span>This media has been flagged by TruthLens AI as likely AI-generated.</span>
                </div>
              )}

              {/* Top-Right Confidence Badge for Video */}
              {activeTab === 'flagged' && isAI && (
                <div
                  style={{
                    position: 'absolute',
                    top: '42px',
                    right: '12px',
                    zIndex: 10,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1.5px solid #ef4444',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  AI CONFIDENCE: {aiScore}%
                </div>
              )}

              {/* Diagonal Watermark Overlay for Video */}
              {activeTab === 'flagged' && isAI && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9
                  }}
                >
                  <div
                    style={{
                      transform: 'rotate(-25deg)',
                      background: 'rgba(127, 29, 29, 0.75)',
                      border: '2px solid #ef4444',
                      padding: '12px 60px',
                      color: '#ef4444',
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '3px',
                      textShadow: '0 4px 10px #000000'
                    }}
                  >
                    ⚠ AI GENERATED MEDIA
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                controls
                onPlay={() => setIsPlayingAudio(true)}
                onPause={() => setIsPlayingAudio(false)}
                src={originalFile ? URL.createObjectURL(originalFile) : originalUrl}
                style={{ width: '100%', maxHeight: '420px', borderRadius: '18px', display: 'block' }}
              />
            </div>
          )}

          {/* AUDIO PREVIEW */}
          {contentType === 'audio' && (
            <div style={{ width: '100%', padding: '32px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: activeTab === 'flagged' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  border: `2px solid ${activeTab === 'flagged' ? themeColor : 'var(--apple-accent-blue)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: activeTab === 'flagged' ? themeColor : 'var(--apple-accent-blue)'
                }}
              >
                <Volume2 style={{ width: 32, height: 32 }} />
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {activeTab === 'flagged' ? 'Flagged Audio Copy (Periodic Spoken Warning Active)' : 'Untouched Original Audio'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {activeTab === 'flagged' ? 'Plays audio watermark warning every 12 seconds during playback.' : 'Raw uploaded audio file without watermark prompts.'}
              </p>

              <audio
                ref={audioRef}
                controls
                onPlay={() => setIsPlayingAudio(true)}
                onPause={() => setIsPlayingAudio(false)}
                src={originalFile ? URL.createObjectURL(originalFile) : originalUrl}
                style={{ width: '100%', maxWidth: '500px' }}
              />
            </div>
          )}

          {/* TEXT / PDF PREVIEW */}
          {(contentType === 'text' || contentType === 'pdf') && (
            <div style={{ width: '100%', padding: '24px', position: 'relative' }}>
              {activeTab === 'flagged' && isAI && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 15,
                    padding: '4px 12px',
                    borderRadius: '14px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  ⚠ FLAGGED AUDIT COPY
                </div>
              )}

              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'var(--bg-primary)',
                  border: `1px solid ${activeTab === 'flagged' ? themeColor : 'var(--glass-border)'}`,
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: 'var(--text-secondary)',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {activeTab === 'flagged' && isAI ? (
                  <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '12px' }}>
                    <div style={{ fontWeight: 800, color: '#ef4444', marginBottom: '8px', fontSize: '0.82rem' }}>
                      [FLAGGED CONTENT - TRUTHLENS AI VERIFICATION AUDIT ID: {verificationId}]
                    </div>
                    {textContent || 'Text content flagged as synthetic AI generation.'}
                  </div>
                ) : (
                  textContent || (originalFile ? `Uploaded Document: ${originalFile.name}` : 'Original document content.')
                )}
              </div>
            </div>
          )}
        </div>

        {/* METRICS & VERDICT BAR */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '18px',
            background: 'var(--bg-dropzone)',
            border: '1px solid var(--glass-border)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Verdict</div>
            <div style={{ fontWeight: 900, color: themeColor, fontSize: '1.1rem' }}>
              {isAI ? 'Likely AI Generated Media' : 'Verified Authentic Media'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AI Score</div>
              <div style={{ fontWeight: 900, color: themeColor, fontSize: '1.2rem' }}>{aiScore}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Human Score</div>
              <div style={{ fontWeight: 900, color: '#10b981', fontSize: '1.2rem' }}>{humanScore}%</div>
            </div>
          </div>
        </div>

        {/* REPORT SUBMISSION FORM INLINE */}
        {showReportForm && !reportSubmitted && (
          <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flag style={{ width: 16, height: 16, color: '#f59e0b' }} /> Report False Positive or Misuse
            </h4>
            <form onSubmit={handleSubmitFeedback}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Reason (e.g. False Positive / License Audit)"
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}

        {reportSubmitted && (
          <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.85rem', marginBottom: '24px', fontWeight: 700 }}>
            ✓ Feedback report submitted successfully for ID {verificationId}.
          </div>
        )}

        {/* PRIMARY & SECONDARY ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleCopyLink} className="apple-glass-button" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
              {copiedLink ? <Check style={{ width: 14, height: 14, color: '#10b981' }} /> : <Copy style={{ width: 14, height: 14 }} />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button onClick={handleShare} className="apple-glass-button" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
              <Share2 style={{ width: 14, height: 14 }} /> Share
            </button>

            <button onClick={() => setShowReportForm(!showReportForm)} className="apple-glass-button" style={{ padding: '10px 14px', fontSize: '0.82rem', color: '#f59e0b' }}>
              <Flag style={{ width: 14, height: 14 }} /> Report
            </button>

            <button onClick={onOpenFullReport} className="apple-glass-button" style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--apple-accent-blue)' }}>
              <FileText style={{ width: 14, height: 14 }} /> Detailed Report
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={downloadOriginalFile}
              className="apple-glass-button"
              style={{ padding: '12px 18px', fontSize: '0.88rem', fontWeight: 700 }}
            >
              <Download style={{ width: 16, height: 16 }} /> Download Original
            </button>

            <button
              onClick={downloadFlaggedCopy}
              className="apple-primary-button"
              style={{ padding: '12px 22px', fontSize: '0.88rem', fontWeight: 800, background: isAI ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--apple-accent-gradient)' }}
            >
              <Download style={{ width: 16, height: 16 }} /> Download Flagged Copy
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
