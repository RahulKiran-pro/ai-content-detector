import React, { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { API_BASE_URL } from '../config/api';
import { 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  FileCheck, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Coins,
  ShieldCheck,
  Zap,
  Info,
  AlertTriangle,
  Download,
  Share2,
  Copy,
  Flag,
  Check,
  ShieldAlert
} from 'lucide-react';
import FlaggedMediaViewer from './FlaggedMediaViewer';
import VerificationReportModal from './VerificationReportModal';

const CONTENT_TYPES = [
  { id: 'text', label: 'Text Analysis', icon: FileText, desc: 'Detect ChatGPT, Claude & AI text generation', accept: null },
  { id: 'image', label: 'Image Detector', icon: ImageIcon, desc: 'Identify AI-generated images & deepfake art (≤10MB)', accept: '.jpg,.jpeg,.png,.webp,.gif' },
  { id: 'pdf', label: 'PDF Audit', icon: FileCheck, desc: 'Audit PDF authenticity & document tampering (≤2MB)', accept: '.pdf' },
  { id: 'audio', label: 'Audio Synthetics', icon: Music, desc: 'Detect AI voice clones & synthesized speech (≤25MB)', accept: '.mp3,.wav,.m4a,.aac,.flac' },
  { id: 'video', label: 'Video Deepfake', icon: VideoIcon, desc: 'Analyze facial & temporal video manipulation (≤100MB)', accept: '.mp4,.mov,.avi,.mkv,.webm' }
];

export default function AIDetectionPanel() {
  const [activeTab, setActiveTab] = useState('text');
  
  // Inputs
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [useVideoUrl, setUseVideoUrl] = useState(false);
  const [analyzeUpToSeconds, setAnalyzeUpToSeconds] = useState('');

  // Execution & Polling State
  const [taskId, setTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollStatus, setPollStatus] = useState(null); // 'pending' | 'analyzing' | 'done' | 'failed'
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Flagged Content & Verification Report State
  const [showFlaggedViewer, setShowFlaggedViewer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [verificationReport, setVerificationReport] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Credits state per type
  const [credits, setCredits] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch credits whenever active tab changes
  useEffect(() => {
    fetchCredits(activeTab);
    resetFormState();
  }, [activeTab]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const resetFormState = () => {
    setTextContent('');
    setSelectedFile(null);
    setVideoUrl('');
    setAnalyzeUpToSeconds('');
    setTaskId(null);
    setIsSubmitting(false);
    setPollStatus(null);
    setResultData(null);
    setErrorMessage(null);
    setShowFlaggedViewer(false);
    setShowReportModal(false);
    setVerificationReport(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchVerificationReport = async (data, type) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/flagged/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detectionData: data, contentType: type })
      });
      if (res.ok) {
        const text = await res.text();
        const reportData = text ? JSON.parse(text) : null;
        if (reportData) {
          setVerificationReport(reportData);
          if (reportData.aiProbability >= 45) {
            setShowFlaggedViewer(true);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch verification report:', e);
    }
  };

  const fetchCredits = async (type) => {
    setLoadingCredits(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/detect/credits/${type}`);
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        setCredits(data.credits ?? data.remaining_credits ?? data.balance ?? data);
      } else {
        setCredits(null);
      }
    } catch (err) {
      setCredits(null);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const isJobFinished = (data) => {
    if (!data) return false;
    const status = (data.status || data.state || '').toLowerCase();
    if (status === 'done' || status === 'completed') return true;
    if (status === 'failed' || status === 'error') return false;
    if (typeof data.result === 'number' && data.result !== null) return true;
    if (typeof data.score === 'number' && data.score !== null) return true;
    return false;
  };

  const startPolling = (id, type) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    setPollStatus('pending');

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/detect/status/${type}/${id}`);
        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { error: `Server error (${res.status})` };
        }

        if (!res.ok) {
          const msg = data.error || 'Status check failed';
          setErrorMessage(msg);
          setPollStatus('failed');
          clearInterval(pollIntervalRef.current);
          return;
        }

        const currentStatus = (data.status || data.state || 'pending').toLowerCase();
        setPollStatus(currentStatus);

        if (isJobFinished(data)) {
          setResultData(data);
          setPollStatus('done');
          clearInterval(pollIntervalRef.current);
          fetchCredits(type);
          fetchVerificationReport(data, type);
        } else if (currentStatus === 'failed' || currentStatus === 'error') {
          setErrorMessage(data.error || data.result_details?.error_message || 'TruthScan analysis task failed.');
          setPollStatus('failed');
          clearInterval(pollIntervalRef.current);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Error communicating with server during status check.');
        setPollStatus('failed');
        clearInterval(pollIntervalRef.current);
      }
    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setResultData(null);
    setPollStatus(null);
    setIsSubmitting(true);

    try {
      let url = `${API_BASE_URL}/api/detect/${activeTab}`;
      let options = {};

      if (activeTab === 'text') {
        if (!textContent.trim()) {
          throw new Error('Please enter text to analyze.');
        }
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textContent })
        };
      } else if (activeTab === 'video' && useVideoUrl) {
        if (!videoUrl.trim() || !videoUrl.startsWith('http')) {
          throw new Error('Please enter a valid HTTP/HTTPS video URL.');
        }
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl.trim() })
        };
      } else {
        // Multipart file upload for image, pdf, audio, video
        if (!selectedFile) {
          throw new Error(`Please select a ${activeTab.toUpperCase()} file to upload.`);
        }

        // Fast client check for PDF <= 2MB limit
        if (activeTab === 'pdf' && selectedFile.size > 2 * 1024 * 1024) {
          throw new Error('PDF file size exceeds TruthScan 2MB limit. Please upload a smaller PDF.');
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        if (activeTab === 'audio' && analyzeUpToSeconds) {
          formData.append('analyzeUpToSeconds', analyzeUpToSeconds);
        }

        options = {
          method: 'POST',
          body: formData
        };
      }

      const res = await fetch(url, options);
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        if (res.status === 502 || res.status === 504 || !res.status) {
          throw new Error('Backend server is unreachable. Please ensure the backend server is running and accessible.');
        }
        throw new Error(`Server returned non-JSON response (HTTP ${res.status}): ${text.substring(0, 150)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || `Detection submission failed (HTTP ${res.status}).`);
      }

      setIsSubmitting(false);

      if (data.id && data.id !== 'instant') {
        setTaskId(data.id);
        if (isJobFinished(data)) {
          setPollStatus('done');
          setResultData(data);
          fetchCredits(activeTab);
          fetchVerificationReport(data, activeTab);
        } else {
          startPolling(data.id, activeTab);
        }
      } else if (isJobFinished(data) || data.label !== undefined) {
        setPollStatus('done');
        setResultData(data);
        fetchCredits(activeTab);
        fetchVerificationReport(data, activeTab);
      } else {
        throw new Error('Backend returned invalid response structure.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An error occurred during submission.');
    }
  };

  const currentTabObj = CONTENT_TYPES.find(t => t.id === activeTab);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <Sparkles style={{ width: 16, height: 16, color: '#818cf8' }} />
          TruthScan AI Multimodal Forensic Engine
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          color: 'var(--heading-color)',
          marginBottom: '12px',
          letterSpacing: '-0.025em'
        }}>
          Verify Content Authenticity
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Scan Text, Images, PDF Documents, Audio Clones, and Video Deepfakes using official TruthScan API.
        </p>
      </div>

      {/* Apple Liquid Dock Tabs Bar */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="floating-dock" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {CONTENT_TYPES.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="apple-glass-button"
                style={{
                  padding: '10px 18px',
                  borderRadius: '18px',
                  background: isActive ? 'var(--apple-accent-gradient)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
                  boxShadow: isActive ? '0 8px 25px rgba(2, 132, 199, 0.35), var(--glass-highlight)' : 'none',
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                  fontWeight: isActive ? 800 : 600
                }}
              >
                <Icon style={{ width: 18, height: 18 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form Glass Panel */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        {/* Header & Service Credits Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--glass-border)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--heading-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentTabObj.icon && React.createElement(currentTabObj.icon, { style: { width: 22, height: 22, color: 'var(--apple-accent-blue)' } })}
              {currentTabObj.label}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
              {currentTabObj.desc}
            </p>
          </div>

          {/* Credits Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'var(--bg-glass-hover)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.85rem'
          }}>
            <Coins style={{ width: 16, height: 16, color: '#f59e0b' }} />
            <span style={{ color: 'var(--text-muted)' }}>Balance:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {loadingCredits ? '...' : (credits !== null ? credits : 'API Ready')}
            </span>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit}>
          {/* 1. TEXT INPUT */}
          {activeTab === 'text' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Text Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste or type text here to detect AI generation..."
                rows={7}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'var(--bg-dropzone)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* 2. FILE UPLOAD DROPZONE */}
          {activeTab !== 'text' && (!useVideoUrl) && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Upload {activeTab.toUpperCase()} File
                </label>
                {activeTab === 'video' && (
                  <button
                    type="button"
                    onClick={() => setUseVideoUrl(true)}
                    style={{ fontSize: '0.8rem', color: 'var(--apple-accent-blue)', textDecoration: 'underline' }}
                  >
                    Switch to Video URL
                  </button>
                )}
              </div>

              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: selectedFile ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-dropzone)',
                  borderColor: selectedFile ? 'var(--apple-accent-blue)' : 'var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={currentTabObj.accept}
                  style={{ display: 'none' }}
                />
                
                <Upload style={{ width: 36, height: 36, color: selectedFile ? 'var(--apple-accent-blue)' : 'var(--text-muted)', margin: '0 auto 12px auto' }} />

                {selectedFile ? (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'File'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.975rem' }}>
                      Click to select or drop {activeTab.toUpperCase()} file here
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '6px' }}>
                      Supported formats: {currentTabObj.accept}
                    </div>
                    {activeTab === 'pdf' && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '8px',
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        <Info style={{ width: 14, height: 14 }} /> Note: TruthScan limits PDF size to ≤ 2MB
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIDEO URL INPUT */}
          {activeTab === 'video' && useVideoUrl && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Video Hosted URL
                </label>
                <button
                  type="button"
                  onClick={() => setUseVideoUrl(false)}
                  style={{ fontSize: '0.8rem', color: '#818cf8', textDecoration: 'underline' }}
                >
                  Switch to File Upload
                </button>
              </div>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          )}

          {/* AUDIO OPTIONAL PARAMETER */}
          {activeTab === 'audio' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Analyze Up To Seconds (Optional - controls scan cost)
              </label>
              <input
                type="number"
                value={analyzeUpToSeconds}
                onChange={(e) => setAnalyzeUpToSeconds(e.target.value)}
                placeholder="e.g. 30 (Leave blank for full duration)"
                min="1"
                max="600"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || pollStatus === 'pending' || pollStatus === 'analyzing'}
            className="apple-primary-button"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: (isSubmitting || pollStatus === 'pending' || pollStatus === 'analyzing') ? 0.7 : 1
            }}
          >
            {(isSubmitting || pollStatus === 'pending' || pollStatus === 'analyzing') ? (
              <>
                <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                <span>
                  {isSubmitting ? 'Uploading & Initiating...' : `TruthScan ${pollStatus.toUpperCase()}...`}
                </span>
              </>
            ) : (
              <>
                <Zap style={{ width: 20, height: 20 }} />
                <span>Run TruthScan AI Detection</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <AlertCircle style={{ width: 20, height: 20, color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Detection Error</div>
            <div style={{ fontSize: '0.875rem', marginTop: '2px', lineHeight: '1.5' }}>
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATUS CARD (While Pending or Analyzing) */}
      {(isSubmitting || pollStatus === 'pending' || pollStatus === 'analyzing') && !resultData && (
        <div className="glass-card" style={{ padding: '36px 24px', textAlign: 'center', marginBottom: '24px', borderRadius: '24px' }}>
          <div style={{
            width: '260px',
            height: '260px',
            margin: '0 auto 16px auto',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 12px 35px rgba(56, 189, 248, 0.25), var(--glass-highlight)',
            border: '1px solid var(--glass-border)',
            background: '#000000'
          }}>
            <video
              src="https://www.image2url.com/r2/default/videos/1785999875031-74dff80c-8203-49ca-8569-0d7180003cba.mov"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            TruthScan {activeTab.toUpperCase()} Engine: {isSubmitting ? 'UPLOADING & INITIATING' : pollStatus.toUpperCase()}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 16px auto' }}>
            Analyzing digital forensic artifacts and spectral patterns for {activeTab.toUpperCase()} content. Polling status...
          </p>
          {taskId && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Task ID: {taskId}
            </div>
          )}
        </div>
      )}

      {/* RESULTS PRESENTATION CARD */}
      {pollStatus === 'done' && resultData && (
        <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          {/* Top Result Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '18px',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981'
              }}>
                <ShieldCheck style={{ width: 28, height: 28 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>TruthScan Forensic Results</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Analysis completed for {activeTab.toUpperCase()} input
                </p>
              </div>
            </div>
            <button
              onClick={resetFormState}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: '#cbd5e1'
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} /> New Scan
            </button>
          </div>

          {/* TYPE-SPECIFIC RESULTS DISPLAYS */}

          {/* 1. TEXT RESULT */}
          {activeTab === 'text' && (() => {
            const score = Math.round(resultData.result ?? resultData.score ?? resultData.ai_score ?? 0);
            const rawLabel = resultData.label || resultData.verdict;
            const label = rawLabel ? rawLabel : (score >= 50 ? 'AI' : 'Human');
            const isAI = score >= 50 || (rawLabel && rawLabel.toLowerCase().includes('ai'));
            const analysisObj = resultData.analysis_results || resultData.result_details?.analysis_results;
            const reasoning = analysisObj?.detailedReasoning || analysisObj?.detailed_reasoning;
            const indicators = analysisObj?.keyIndicators || analysisObj?.key_indicators;
            const recommendations = analysisObj?.recommendations;

            return (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  {/* Result Score */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>AI Probability Score</div>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color: isAI ? '#ef4444' : '#10b981'
                    }}>
                      {score}%
                    </div>
                  </div>

                  {/* Classification Label */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Verdict Label</div>
                    <div style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: isAI ? '#ef4444' : '#10b981',
                      marginTop: '8px'
                    }}>
                      {label}
                    </div>
                  </div>
                </div>

                {/* Score Meter Bar */}
                <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Human Generated</span>
                    <span>AI Generated</span>
                  </div>
                  <div style={{
                    height: '10px',
                    width: '100%',
                    borderRadius: '5px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${score}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                {/* Deep Analysis Details (if provided by TruthScan) */}
                {analysisObj && (
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color)',
                    marginTop: '20px'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles style={{ width: 18, height: 18 }} /> Deep AI Forensic Analysis
                    </h4>

                    {reasoning && (
                      <div style={{ marginBottom: '14px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <strong>Reasoning:</strong> {reasoning}
                      </div>
                    )}

                    {Array.isArray(indicators) && indicators.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Key Indicators:</div>
                        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                          {indicators.map((indicator, idx) => (
                            <li key={idx}>{typeof indicator === 'object' ? JSON.stringify(indicator) : indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recommendations && (
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        <strong>Recommendation:</strong> {typeof recommendations === 'object' ? JSON.stringify(recommendations) : recommendations}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. IMAGE RESULT */}
          {activeTab === 'image' && (() => {
            const details = resultData.result_details || {};
            const finalResult = details.final_result || (typeof resultData.result === 'string' ? resultData.result : resultData.label) || 'Processed';
            const confidenceVal = details.confidence ?? resultData.confidence ?? (typeof resultData.result === 'number' ? resultData.result : 0);
            const confidencePct = typeof confidenceVal === 'number'
              ? (confidenceVal <= 1.0 ? (confidenceVal * 100).toFixed(1) : confidenceVal.toFixed(1))
              : '0.0';
            const isAI = (finalResult.toLowerCase().includes('ai') || finalResult.toLowerCase().includes('edited') || Number(confidencePct) >= 50);

            return (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  {/* Verdict Card */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Authenticity Verdict</div>
                    <div style={{
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: isAI ? '#ef4444' : '#10b981',
                      textTransform: 'uppercase'
                    }}>
                      {finalResult}
                    </div>
                  </div>

                  {/* Confidence Card */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>AI Confidence Score</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isAI ? '#ef4444' : '#10b981' }}>
                      {confidencePct}%
                    </div>
                  </div>
                </div>

                {/* Score Meter Bar */}
                <div style={{ marginTop: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Authentic Real Image</span>
                    <span>AI Generated / Deepfake</span>
                  </div>
                  <div style={{
                    height: '10px',
                    width: '100%',
                    borderRadius: '5px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, Number(confidencePct)))}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                {/* Heatmap Section */}
                {details.heatmap_url && (
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color)',
                    marginTop: '20px',
                    textAlign: 'center'
                  }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#818cf8' }}>
                      AI Detection Artifact Heatmap Overlay
                    </h4>
                    <img 
                      src={details.heatmap_url} 
                      alt="AI Detection Heatmap" 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '10px', border: '1px solid var(--border-color)' }} 
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3. PDF RESULT */}
          {activeTab === 'pdf' && (
            <div>
              <div style={{
                padding: '20px',
                borderRadius: '14px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Document Authenticity Label</div>
                  <div style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: (resultData.label || '').toLowerCase().includes('tampered') ? '#ef4444' : '#10b981',
                    marginTop: '4px'
                  }}>
                    {resultData.label || 'Genuine'}
                  </div>
                </div>
              </div>

              {/* Detailed Explanation */}
              {(resultData.detailed_explanation || resultData.explanation || resultData.details) && (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#cbd5e1' }}>
                    Forensic Explanation
                  </div>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {resultData.detailed_explanation || resultData.explanation || JSON.stringify(resultData.details)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. AUDIO RESULT */}
          {activeTab === 'audio' && (() => {
            const rawProb = resultData.result_details?.mean_ai_prob ?? resultData.mean_ai_prob ?? resultData.result ?? 0;
            const probPct = typeof rawProb === 'number' ? (rawProb <= 1.0 ? Math.round(rawProb * 100) : Math.round(rawProb)) : 0;
            const isSynthetic = probPct >= 50;
            const details = resultData.result_details || {};
            const chunks = details.individual_chunks_ai_prob || resultData.individual_chunks_ai_prob;

            return (
              <div>
                {details.is_valid === false && (
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    fontSize: '0.875rem',
                    marginBottom: '16px'
                  }}>
                    <strong>Audio Format Warning:</strong> TruthScan reported that the audio stream could not be decoded. Please upload a standard MP3, WAV, M4A, FLAC, or OGG file.
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mean AI Voice Probability</div>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color: isSynthetic ? '#ef4444' : '#10b981'
                    }}>
                      {probPct}%
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Synthetic Audio Verdict</div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      marginTop: '8px',
                      textTransform: 'uppercase',
                      color: isSynthetic ? '#ef4444' : '#10b981'
                    }}>
                      {isSynthetic ? 'AI Voice Clone' : 'Natural Human Speech'}
                    </div>
                  </div>
                </div>

                {/* Score Meter Bar */}
                <div style={{ marginTop: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Human Speech</span>
                    <span>AI Voice Clone</span>
                  </div>
                  <div style={{
                    height: '10px',
                    width: '100%',
                    borderRadius: '5px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${probPct}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                {/* Audio Details Card */}
                {(details.original_duration || Array.isArray(chunks)) && (
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#818cf8' }}>
                      Audio Forensic Metadata
                    </h4>

                    {details.original_duration && (
                      <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '10px' }}>
                        <strong>Duration:</strong> {details.original_duration}s {details.is_truncated ? `(Analyzed first ${details.truncated_duration}s)` : ''}
                      </div>
                    )}

                    {Array.isArray(chunks) && chunks.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Per-Chunk AI Probabilities:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {chunks.map((chunkScore, idx) => {
                            const chunkPct = Math.round(chunkScore <= 1.0 ? chunkScore * 100 : chunkScore);
                            return (
                              <div key={idx} style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'rgba(15, 23, 42, 0.7)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.8rem',
                                color: chunkPct >= 50 ? '#fca5a5' : '#6ee7b7'
                              }}>
                                Chunk {idx + 1}: <strong>{chunkPct}%</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 5. VIDEO RESULT */}
          {activeTab === 'video' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Deepfake Manipulation Score</div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: (resultData.result ?? 0) > 0.5 ? '#ef4444' : '#10b981'
                  }}>
                    {resultData.result !== undefined
                      ? (resultData.result <= 1.0 ? `${(resultData.result * 100).toFixed(1)}%` : `${resultData.result}%`)
                      : 'N/A'}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Final Stage Breakdown</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '8px' }}>
                    {resultData.final_stage || resultData.stage || 'Completed'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION DASHBOARD BUTTONS BAR */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowFlaggedViewer(!showFlaggedViewer)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: showFlaggedViewer ? '#ef4444' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
                }}
              >
                <AlertTriangle style={{ width: 16, height: 16 }} />
                {showFlaggedViewer ? 'Hide Flagged Copy' : 'Generate Flagged Copy'}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(129, 140, 248, 0.4)',
                  color: '#a5b4fc',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck style={{ width: 16, height: 16 }} /> Verification Report
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/verify/${verificationReport?.verificationId || 'TL-SCAN'}`;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedLink ? <Check style={{ width: 15, height: 15, color: '#10b981' }} /> : <Copy style={{ width: 15, height: 15 }} />}
                {copiedLink ? 'Link Copied!' : 'Copy Verification Link'}
              </button>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fcd34d',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Flag style={{ width: 15, height: 15 }} /> Report Content
            </button>
          </div>

          {/* FLAGGED MEDIA VIEWER MODULE */}
          {showFlaggedViewer && (
            <div style={{ marginTop: '24px' }}>
              <FlaggedMediaViewer
                contentType={activeTab}
                originalFile={selectedFile}
                originalUrl={videoUrl || (resultData.preview_url || resultData.url)}
                textContent={textContent}
                verificationData={resultData}
                report={verificationReport}
                onClose={() => setShowFlaggedViewer(false)}
              />
            </div>
          )}

          {/* Raw JSON inspection accordion for debugging */}
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Inspect TruthScan API Raw JSON Output
            </summary>
            <pre style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: '#090d16',
              color: '#38bdf8',
              fontSize: '0.775rem',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono)'
            }}>
              {JSON.stringify(resultData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* VERIFICATION REPORT MODAL */}
      {showReportModal && (
        <VerificationReportModal
          report={verificationReport}
          resultData={resultData}
          contentType={activeTab}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
