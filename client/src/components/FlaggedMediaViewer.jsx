import React, { useEffect, useRef, useState } from 'react';
import { 
  AlertTriangle, 
  Download, 
  Eye, 
  Volume2, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  Sparkles,
  Info
} from 'lucide-react';

export default function FlaggedMediaViewer({ 
  contentType, 
  originalFile, 
  originalUrl, 
  textContent, 
  verificationData, 
  report, 
  onClose 
}) {
  const [activeView, setActiveView] = useState('flagged'); // 'flagged' | 'original'
  const [flaggedImageUrl, setFlaggedImageUrl] = useState(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const isAI = (report?.aiProbability ?? verificationData?.result ?? 0) >= 45;
  const aiScore = report?.aiProbability ?? Math.round(verificationData?.result ?? 0);
  const humanScore = 100 - aiScore;
  const verificationId = report?.verificationId || `TL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const watermarkLabel = isAI ? '⚠ AI GENERATED' : '⚠ VERIFIED AUTHENTIC';
  const themeColor = isAI ? '#ef4444' : '#10b981';

  // Generate Flagged Watermarked Image on Canvas
  useEffect(() => {
    if (contentType === 'image' && (originalFile || originalUrl)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      if (originalFile) {
        img.src = URL.createObjectURL(originalFile);
      } else if (originalUrl) {
        img.src = originalUrl;
      }

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = img.width || 800;
        const height = img.height || 600;

        canvas.width = width;
        const footerHeight = Math.max(80, Math.round(height * 0.12));
        canvas.height = height + footerHeight;

        // 1. Draw Original Image
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Draw High-Visibility Diagonal Watermark
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((-30 * Math.PI) / 180);

        const fontSize = Math.max(36, Math.round(width * 0.085));
        ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Dark Red Backing Strip behind Watermark for High Visibility
        const stripHeight = fontSize * 1.6;
        ctx.fillStyle = isAI ? 'rgba(127, 29, 29, 0.75)' : 'rgba(6, 78, 59, 0.75)';
        ctx.fillRect(-width, -stripHeight / 2, width * 2, stripHeight);

        // Top and Bottom Gold/Red Border lines on Backing Strip
        ctx.strokeStyle = isAI ? '#ef4444' : '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-width, -stripHeight / 2);
        ctx.lineTo(width, -stripHeight / 2);
        ctx.moveTo(-width, stripHeight / 2);
        ctx.lineTo(width, stripHeight / 2);
        ctx.stroke();

        // Thick Black Text Border / Outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(8, Math.round(width * 0.012));
        ctx.strokeText(watermarkLabel, 0, 0);

        // Heavy Drop Shadow for High Contrast
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 6;

        // Bold Dark Crimson Red Fill
        ctx.fillStyle = isAI ? '#dc2626' : '#10b981';
        ctx.fillText(watermarkLabel, 0, 0);

        // Repeat Secondary Warning Sub-text
        ctx.shadowColor = 'transparent';
        ctx.font = `800 ${Math.max(16, Math.round(width * 0.032))}px system-ui, sans-serif`;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText('⚠ TRUTHLENS AI • SYNTHETIC MEDIA VERIFICATION AUDIT', 0, -stripHeight * 0.75);
        ctx.strokeText('⚠ TRUTHLENS AI • SYNTHETIC MEDIA VERIFICATION AUDIT', 0, stripHeight * 0.75);

        ctx.fillStyle = '#ffffff';
        ctx.fillText('⚠ TRUTHLENS AI • SYNTHETIC MEDIA VERIFICATION AUDIT', 0, -stripHeight * 0.75);
        ctx.fillText('⚠ TRUTHLENS AI • SYNTHETIC MEDIA VERIFICATION AUDIT', 0, stripHeight * 0.75);

        ctx.restore();

        // 3. Draw Corner Badge
        const badgeWidth = Math.max(160, Math.round(width * 0.22));
        const badgeHeight = 36;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(width - badgeWidth - 16, 16, badgeWidth, badgeHeight, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = themeColor;
        ctx.font = '800 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`AI CONFIDENCE: ${aiScore}%`, width - (badgeWidth / 2) - 16, 38);

        // 4. Draw Verification Footer Banner
        const footerY = height;
        ctx.fillStyle = 'rgba(11, 15, 25, 0.94)';
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
        ctx.fillText(`TruthLens AI Verification Report [ID: ${verificationId}]`, 20, footerY + 30);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `600 ${Math.max(11, Math.round(width * 0.018))}px system-ui, sans-serif`;
        ctx.fillText(`AI Score: ${aiScore}% | Human: ${humanScore}% | Verdict: ${isAI ? 'AI Generated Media' : 'Authentic Media'} | Date: ${new Date().toLocaleString()}`, 20, footerY + 56);

        // Export Flagged Data URL
        try {
          const flaggedUrl = canvas.toDataURL('image/png');
          setFlaggedImageUrl(flaggedUrl);
        } catch (e) {
          console.warn('Canvas export failed:', e);
        }
      };
    }
  }, [contentType, originalFile, originalUrl, isAI, aiScore]);

  // Audio Periodic Spoken Warning Overlay (every 12s)
  useEffect(() => {
    let audioTimer = null;
    if (contentType === 'audio' && isAI) {
      audioTimer = setInterval(() => {
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance("Warning. This audio has been flagged as potentially AI generated by TruthLens AI.");
          msg.rate = 1.0;
          msg.volume = 0.55; // Lower volume than main audio
          window.speechSynthesis.speak(msg);
        }
      }, 12000);
    }
    return () => {
      if (audioTimer) clearInterval(audioTimer);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [contentType, isAI]);

  // Handle Downloads
  const downloadFlaggedCopy = () => {
    if (contentType === 'image') {
      if (flaggedImageUrl) {
        const link = document.createElement('a');
        link.href = flaggedImageUrl;
        link.download = `FLAGGED_TRUTHLENS_${originalFile?.name || 'image.png'}`;
        link.click();
      } else if (canvasRef.current) {
        const link = document.createElement('a');
        link.href = canvasRef.current.toDataURL('image/png');
        link.download = `FLAGGED_TRUTHLENS_${originalFile?.name || 'image.png'}`;
        link.click();
      }
    } else if (contentType === 'text') {
      const flaggedText = `[FLAGGED CONTENT COPY - TRUTHLENS AI VERIFICATION]\nVERDICT: ${isAI ? 'AI GENERATED (SYNTHETIC)' : 'AUTHENTIC'}\nAI SCORE: ${aiScore}% | ID: ${verificationId}\nTIMESTAMP: ${new Date().toLocaleString()}\n--------------------------------------------------\n${textContent}`;
      const blob = new Blob([flaggedText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FLAGGED_TRUTHLENS_REPORT_${verificationId}.txt`;
      link.click();
    } else if (originalFile) {
      // Download flagged original file copy
      const link = document.createElement('a');
      link.href = URL.createObjectURL(originalFile);
      link.download = `FLAGGED_COPY_${originalFile.name}`;
      link.click();
    }
  };

  const downloadOriginalFile = () => {
    if (originalFile) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(originalFile);
      link.download = originalFile.name;
      link.click();
    } else if (contentType === 'text') {
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ORIGINAL_TEXT_${verificationId}.txt`;
      link.click();
    }
  };

  return (
    <div style={{
      borderRadius: '16px',
      background: 'rgba(15, 23, 42, 0.95)',
      border: `1.5px solid ${themeColor}`,
      padding: '24px',
      marginBottom: '24px',
      boxShadow: `0 10px 30px ${isAI ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.2)'}`
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: isAI ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: themeColor
          }}>
            <ShieldAlert style={{ width: 28, height: 28 }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              TruthLens Flagged Content Generator
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Original file remains <strong>100% unchanged</strong>. Separate watermarked copy generated for report audit.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(30, 41, 59, 0.8)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => setActiveView('flagged')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeView === 'flagged' ? themeColor : 'transparent',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle style={{ width: 15, height: 15 }} /> Flagged Copy
          </button>
          <button
            onClick={() => setActiveView('original')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeView === 'original' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye style={{ width: 15, height: 15 }} /> Untouched Original
          </button>
        </div>
      </div>

      {/* MEDIA PREVIEW AREA */}

      {/* 1. IMAGE DISPLAY */}
      {contentType === 'image' && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {activeView === 'flagged' ? (
            <div>
              <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} />
            </div>
          ) : (
            <div>
              <img 
                src={originalFile ? URL.createObjectURL(originalFile) : originalUrl} 
                alt="Untouched Original" 
                style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '12px' }} 
              />
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#10b981' }}>
                ✓ Original File Preserved Untouched (No Watermark)
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. VIDEO DISPLAY */}
      {contentType === 'video' && (
        <div style={{ position: 'relative', width: '100%', marginBottom: '20px', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Top Playback Warning Banner */}
          {activeView === 'flagged' && isAI && (
            <div style={{
              background: 'rgba(225, 29, 72, 0.92)',
              color: '#ffffff',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10
            }}>
              <AlertTriangle style={{ width: 18, height: 18 }} />
              This media has been flagged by TruthLens AI as likely AI-generated.
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <video
              controls
              style={{ width: '100%', maxHeight: '480px', background: '#000000', display: 'block' }}
              src={originalFile ? URL.createObjectURL(originalFile) : originalUrl}
            />

            {/* Continuous Diagonal Video Overlay */}
            {activeView === 'flagged' && isAI && (
              <>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(127, 29, 29, 0.35)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    transform: 'rotate(-25deg)',
                    width: '120%',
                    background: 'linear-gradient(90deg, rgba(185, 28, 28, 0.85) 0%, rgba(220, 38, 38, 0.95) 50%, rgba(185, 28, 28, 0.85) 100%)',
                    borderTop: '4px solid #fca5a5',
                    borderBottom: '4px solid #fca5a5',
                    padding: '16px 0',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.85)'
                  }}>
                    <div style={{
                      color: '#ffffff',
                      fontSize: 'clamp(1.8rem, 4.5vw, 3.8rem)',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '3px',
                      WebkitTextStroke: '2px #000000',
                      textShadow: '0 4px 16px #000000',
                      whiteSpace: 'nowrap'
                    }}>
                      ⚠ THIS VIDEO MAY CONTAIN SYNTHETIC MEDIA
                    </div>
                    <div style={{
                      color: '#fef08a',
                      fontSize: 'clamp(0.85rem, 2vw, 1.2rem)',
                      fontWeight: 800,
                      letterSpacing: '2px',
                      WebkitTextStroke: '1px #000000',
                      marginTop: '4px'
                    }}>
                      TRUTHLENS AI VERIFICATION AUDIT • AI SCORE: {aiScore}%
                    </div>
                  </div>
                </div>

                {/* Persistent Corner Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1.5px solid #ef4444',
                  color: '#ef4444',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  pointerEvents: 'none'
                }}>
                  AI SCORE: {aiScore}%
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. AUDIO DISPLAY */}
      {contentType === 'audio' && (
        <div style={{
          padding: '24px',
          borderRadius: '14px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Volume2 style={{ width: 24, height: 24, color: themeColor }} />
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff' }}>
                {activeView === 'flagged' ? 'Flagged Audio Copy (Periodic Spoken Warning Enabled)' : 'Original Untouched Audio'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {activeView === 'flagged' ? 'Spoken warning repeats every 10–15 seconds at a lower volume to ensure transparency.' : 'Clean audio playback.'}
              </div>
            </div>
          </div>

          <audio
            ref={audioRef}
            controls
            style={{ width: '100%' }}
            src={originalFile ? URL.createObjectURL(originalFile) : originalUrl}
          />
        </div>
      )}

      {/* 4. TEXT DISPLAY */}
      {contentType === 'text' && (
        <div style={{
          padding: '20px',
          borderRadius: '14px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${activeView === 'flagged' ? themeColor : 'rgba(255,255,255,0.1)'}`,
          marginBottom: '20px'
        }}>
          {activeView === 'flagged' ? (
            <div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '12px'
              }}>
                ⚠ FLAGGED COPY — TRUTHLENS AI VERIFICATION REPORT (ID: {verificationId})
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {textContent}
              </div>
            </div>
          ) : (
            <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {textContent}
            </div>
          )}
        </div>
      )}

      {/* ACTION CONTROLS */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={downloadFlaggedCopy}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: isAI ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'var(--primary-gradient)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
          }}
        >
          <Download style={{ width: 16, height: 16 }} /> Download Flagged Copy
        </button>

        <button
          onClick={downloadOriginalFile}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Download style={{ width: 16, height: 16 }} /> Download Original
        </button>
      </div>
    </div>
  );
}
